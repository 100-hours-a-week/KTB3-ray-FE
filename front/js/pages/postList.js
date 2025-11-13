import { api } from '../api.js';
import { navigateTo } from '../router.js';
import { isLoggedIn } from '../auth.js';
import { renderHeader } from '../components/header.js';
import {formatDateTime, formatNumber} from '../fromatter.js';

export const postListPage = async () => {
    const content = document.getElementById('content');
    
    // 로딩 표시
    content.innerHTML = `
        <div class="container">
            <div class="loading">게시글을 불러오는 중</div>
        </div>
    `;
    
    renderHeader();
    try {
        // API에서 게시글 목록 가져오기
        const posts = await api.getPosts();
        
        // 게시글이 없는 경우
        if (!posts || posts.length === 0) {
            content.innerHTML = `
                <div class="container">
                    <div class="card" style="text-align: center; padding: 3rem;">
                        <h2>아직 게시글이 없습니다</h2>
                        <p style="color: #666; margin: 1rem 0;">첫 번째 게시글을 작성해보세요!</p>
                        ${isLoggedIn() ? '<a href="/posts/new" data-link class="btn btn-primary">첫 게시글 작성하기</a>' : '<a href="/login" data-link class="btn btn-primary">로그인하고 글쓰기</a>'}
                    </div>
                </div>
            `;
            return;
        }
        
        // 게시글 목록 렌더링
        content.innerHTML = `
            <div class="container">
                <div style="align-items: center; margin-bottom: 2rem;">
                    <div style="text-align: center; font-size:30px; font-weight:lighter;">안녕하세요,</div>
                    <div style="text-align: center; font-size:30px; font-weight:lighter;">아무 말 대잔치 <strong>게시판</strong> 입니다.</div>
                    <div style="display: flex; flex-direction: row-reverse">
                        <a href="/posts/new" data-link class="btn btn-primary" style="width: 150px; text-align: center;">게시글 작성</a>
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
            <div style="padding: 1.5rem">
                <h2 class="post-title">${escapeHtml(title)}</h2>
                <div style="display: flex; justify-content: space-between">
                    <p class="post-meta">
                        좋아요 ${escapeHtml(formatNumber(post.likeCount))}&nbsp;&nbsp;
                        댓글 ${escapeHtml(formatNumber(post.commentCount))}&nbsp;&nbsp;
                        조회수 ${escapeHtml(formatNumber(post.viewCount))}
                    </p>
                    <p class="post-meta">${escapeHtml(formattedDate)}</p>
                
                </div>
            </div>
            <div style="border: 0.5px solid #c9c9c9ff"></div>
            <div style="padding: 1rem">
                <div style="display: flex; align-items: center">
                    ${post.authorProfileImg ? `
                        <img src="${post.authorProfileImg}" alt="프로필" class="profile-image">
                    ` : `
                        <div class="profile-image no-image"></div>
                    `}
                    <p>
                        <strong>&nbsp;&nbsp;&nbsp;${escapeHtml(post.author || '익명')}</strong>
                    </p>
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