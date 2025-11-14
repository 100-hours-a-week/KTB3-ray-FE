import { addRoute, router, setupRouterLinks, navigateTo } from './router.js';
import { renderHeader } from './components/header.js';
import { getState, setState, subscribe } from './state.js';
import { getUserFromToken, isLoggedIn, logout } from './auth.js';
import { api } from './api.js';

// 페이지 import
import { loginPage } from './pages/login.js';
import { registerPage } from './pages/register.js';
import { postListPage } from './pages/postList.js';
import { postDetailPage } from './pages/postDetail.js';
import { postNewPage, postEditPage } from './pages/postForm.js';
import { profilePage } from './pages/profile.js';
import { passwordEditPage } from './pages/password.js'

// 라우트 등록
addRoute('/', postListPage);
addRoute('/login', loginPage);
addRoute('/register', registerPage);
addRoute('/posts/new', postNewPage);
addRoute('/posts/:id', postDetailPage);
addRoute('/posts/:id/edit', postEditPage);
addRoute('/profile', profilePage, true);
addRoute('/password/edit', passwordEditPage, true);

// 앱 초기화
const initApp = async () => {
    console.log('🚀 앱 초기화 시작...');

    if (isLoggedIn()) {
        try {
            // ⭐ API로 전체 프로필 정보 가져오기
            const profile = await api.getProfile();
            setState({ 
                user: profile.nickname,
                profileImage: profile.profileImage || null
            });
            console.log('✅ 로그인 상태 복원:', profile);
        } catch (error) {
            console.error('❌ 프로필 로드 실패:', error);
            // 토큰이 만료되었거나 유효하지 않으면 로그아웃
            logout();
            navigateTo('/login');
        }
    }
    // 헤더 렌더링
    renderHeader();
    
    // 상태 변경 시 헤더 업데이트
    subscribe((state) => {
        renderHeader();
    });
    
    // 라우터 링크 설정
    setupRouterLinks();

    // 🔐 로그인 체크 (특정 페이지 제외)
    const path = window.location.pathname;
    const publicPages = ['/login', '/register'];  // 비회원 접근 가능
    
    if (!isLoggedIn() && !publicPages.includes(path)) {
        alert('로그인이 필요합니다.');
        navigateTo('/login');
    }

    
    // 초기 라우팅
    await router();
    
    console.log('✅ 앱 초기화 완료!');
};

// DOM 로드 완료 시 앱 시작
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
