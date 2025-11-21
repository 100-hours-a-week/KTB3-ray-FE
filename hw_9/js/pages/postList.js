import { api } from '../api.js';
import { navigateTo } from '../router.js';
import { isLoggedIn } from '../auth.js';
import {formatDateTime, formatNumber} from '../fromatter.js';

export const postListPage = async () => {
    const content = document.getElementById('content');
    
    // 로딩 표시
    content.innerHTML = `
        <div class="container">
            <div class="loading">게시글을 불러오는 중</div>
        </div>
    `;
    
    try {
        // API에서 게시글 목록 가져오기
        const posts = await api.getPosts();
        
        // 게시글이 없는 경우
        if (!posts || posts.length === 0) {
            content.innerHTML = `
                <div class="container">
                    <div style="align-items: center; margin-bottom: 2rem; margin-top: 0.5rem">
                        <div style="display: flex; justify-content: space-between">
                            <a href="/posts/new" data-link class="btn btn-post" style="width: 100%; text-align: center;">오늘의 Node 작성하러가기 🖋️</a>
                        </div>
                        <p style="color: #2c2c2cff; margin: 1rem 0; text-align:center">아직 게시글이 없습니다</p>
                    </div>
                        
                </div>
            `;
            return;
        }
        
        // 게시글 목록 렌더링
        content.innerHTML = `
            <div class="container">
                <div style="align-items: center; margin-bottom: 2rem; margin-top: 0.5rem">
                    <div style="display: flex; justify-content: space-between">
                        <a href="/posts/new" data-link class="btn btn-post" style="width: 100%; text-align: center;">오늘의 Node 작성하러가기 🖋️</a>
                    </div>
                </div>
                
                <div id="postsList">
                    ${posts.map(post => createPostCard(post)).join('')}
                </div>
            </div>
        `;
        
    } catch (error) {
        content.innerHTML = `
            <div class="container">
                <div class="error-message">
                    게시글을 불러오는데 실패했습니다: ${error.message}
                </div>
                <button class="btn btn-primary" onclick="location.reload()">다시 시도</button>
            </div>
        `;
    }
};

// 게시글 카드 생성 함수
function createPostCard(post) {
    // 날짜 포맷팅
    const date = new Date(post.postedTime);
    const formattedDate = formatDateTime(post.postedTime);
    
    const title = post.title.length > 27 
    ? post.title.substring(0, 25) + '...' 
    : post.title;

    
    return `
        <div class="card post-card" data-post-id="${post.postId}">
            <div style="padding: 1.5rem 1rem 1rem 1rem">
                <div style="display: flex; align-items: center">
                    ${post.authorProfileImg ? `
                        
                        <img src="${post.authorProfileImg}" alt="프로필" class="profile-image">
                    ` : `
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="20" fill="#2b2b2b"/>
                            <circle cx="20.197" cy="11.9212" r="6.00985" fill="white"/>
                            <path d="M31.5271 32.0197C31.5271 30.48 31.2315 28.9555 30.6571 27.533C30.0828 26.1106 29.241 24.8181 28.1797 23.7295C27.1185 22.6408 25.8586 21.7772 24.472 21.188C23.0854 20.5988 21.5993 20.2955 20.0985 20.2955C18.5977 20.2955 17.1115 20.5988 15.725 21.188C14.3384 21.7772 13.0785 22.6408 12.0173 23.7295C10.956 24.8181 10.1142 26.1106 9.53987 27.533C8.96553 28.9555 8.66992 30.48 8.66992 32.0197L20 32L31.5271 32.0197Z" fill="white"/>
                        </svg>
                    `}
                    <p>
                        <strong>&nbsp;&nbsp;&nbsp;${escapeHtml(post.author || '익명')}</strong>
                    </p>
                </div>
            </div>
            <div style="padding: 0rem 1.5rem 1.5rem 1.5rem">
                <h2 class="post-title">${escapeHtml(title)}</h2>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center" class="post-meta">
                        <button class="heart" style="border: none" id="newLikeBtn" ></button>
                        <p id="newLikeCount" style="margin-left: 5px; font-size: 15px;">${escapeHtml(formatNumber(post.likeCount))}</p>
                        <button class="comment" style="border: none; margin-left: 20px"></button>
                        <p style="margin-left: 5px; font-size: 15px;">${escapeHtml(formatNumber(post.commentCount))}</p>
                        <button class="view" style="border: none; margin-left: 20px"></button>
                        <p style="margin-left: 5px; font-size: 15px;">${escapeHtml(formatNumber(post.viewCount))}</p>

                    </div>
                    <p class="post-meta">${formatDateTime(formattedDate)}</p>
                </div>          
            </div>            
        </div>
    `;
}
/*
<p style="color: #666; margin-top: 0.5rem;">
                ${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}
            </p>

*/

// XSS 방지: HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 게시글 카드 클릭 이벤트 (이벤트 위임)
document.addEventListener('click', (event) => {
    const postCard = event.target.closest('.post-card');
    if (postCard) {
        const postId = postCard.dataset.postId;
        navigateTo(`/posts/${postId}`);
    }
});

/*
// 날짜 포맷팅 함수
function formatDateTime(dateString) {
    const date = new Date(dateString);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatNumber(num) {
    if (num >= 1000) {
        return Math.floor(num / 1000) + 'k';
    }
    return num.toString();
}
*/