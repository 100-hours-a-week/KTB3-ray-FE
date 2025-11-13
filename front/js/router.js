// 라우트 정의
const routes = {};

// 라우트 등록
export const addRoute = (path, handler) => {
    routes[path] = handler;
};

// 페이지 이동
export const navigateTo = (path) => {
    // 브라우저 히스토리에 추가
    window.history.pushState({}, '', path);
    
    // 라우트 실행
    router();
};

// 라우터 실행
export const router = async () => {
    // 현재 경로
    const path = window.location.pathname;
    
    // 동적 라우트 매칭 (/posts/:id 같은 것)
    let handler = routes[path];
    let params = {};
    
    if (!handler) {
        // 동적 라우트 찾기
        for (const route in routes) {
            const regex = pathToRegex(route);
            const match = path.match(regex);
            
            if (match) {
                handler = routes[route];
                params = extractParams(route, match);
                break;
            }
        }
    }
    
    // 404
    if (!handler) {
        handler = routes['/404'] || (() => {
            document.getElementById('content').innerHTML = `
                <div class="container">
                    <div class="card">
                        <h1>404 - 페이지를 찾을 수 없습니다</h1>
                        <p>요청하신 페이지가 존재하지 않습니다.</p>
                        <button class="btn btn-primary" onclick="window.history.back()">돌아가기</button>
                    </div>
                </div>
            `;
        });
    }
    
    // 핸들러 실행
    try {
        await handler(params);
    } catch (error) {
        console.error('Route handler error:', error);
        document.getElementById('content').innerHTML = `
            <div class="container">
                <div class="error-message">
                    페이지를 불러오는데 실패했습니다: ${error.message}
                </div>
            </div>
        `;
    }
};

// 경로를 정규표현식으로 변환
const pathToRegex = (path) => {
    return new RegExp('^' + path.replace(/:\w+/g, '([^/]+)') + '$');
};

// 파라미터 추출
const extractParams = (route, match) => {
    const keys = route.match(/:\w+/g) || [];
    const values = match.slice(1);
    
    return keys.reduce((params, key, index) => {
        params[key.slice(1)] = values[index];
        return params;
    }, {});
};

// 링크 클릭 처리
export const setupRouterLinks = () => {
    document.addEventListener('click', (event) => {
        // data-link 속성을 가진 링크만
        if (event.target.matches('[data-link]')) {
            event.preventDefault();
            const path = event.target.getAttribute('href');
            navigateTo(path);
        }
    });
};

// 브라우저 뒤로가기/앞으로가기
window.addEventListener('popstate', router);
