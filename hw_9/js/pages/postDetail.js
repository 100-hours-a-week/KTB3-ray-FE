import { api } from '../api.js';
import { navigateTo } from '../router.js';
import { getState } from '../state.js';
import { isLoggedIn } from '../auth.js';
import { renderHeader } from '../components/header.js';
import { formatDateTime, formatNumber } from '../fromatter.js';
import { showModal, showAlert } from '../components/modal.js';  // ⭐ 추가

export const postDetailPage = async ({ id }) => {
    const content = document.getElementById('content');

    renderHeader({ showBackButton: true });
    
    content.innerHTML = `
        <div class="container">
            <div class="loading">게시글을 불러오는 중</div>
        </div>
    `;
    
    try {
        const [post, comments] = await Promise.all([
            api.getPost(id),
            api.getComments(id)
        ]);
        
        const { user } = getState();
        const isAuthor = post.postDetails.mine;
        let isLiked = post.postDetails.postLiked;
        
        content.innerHTML = `
            <div class="container">
                <div>
                    <!-- 게시글 헤더 -->
                    <div style="margin-left:30px; margin-right:30px">
                        <h1>${escapeHtml(post.postSummary.title)}</h1>
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                            <div style="display: flex; align-items: center;">
                                ${post.postSummary.authorProfileImg ? `
                                    <img src="${post.postSummary.authorProfileImg}" alt="프로필" class="profile-image">
                                ` : `
                                    <div class="profile-image no-image"></div>
                                `}
                                <strong>&nbsp;&nbsp;&nbsp;${escapeHtml(post.postSummary.author || '익명')}</strong>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${formatDateTime(post.postSummary.postedTime)}
                            </div>
                            
                            ${isAuthor ? `
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-form" id="editBtn">수정</button>
                                    <button class="btn btn-form" id="deleteBtn">삭제</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <!-- 구분선 -->
                    <div style="border: 0.5px solid #c9c9c9ff"></div>
                    <!-- 게시글 내용 -->
                    <div style="margin-left:30px; margin-right:30px">
                        ${post.postDetails.imgUrl ? `
                            <img src="${post.postDetails.imgUrl}" style="width: 600px; padding-top: 20px">
                        ` : ""}
                        <div style="white-space: pre-line; line-height: 1.8;">
                            ${escapeHtml(post.postDetails.content)}
                        </div>
                    </div>
                </div>
                <!-- 좋아요, 조회수, 댓글 -->
                <div style="display: flex; justify-content: center">
                    <button class="gray-box ${isLiked ? 'liked' : ''}" id="likeBtn">
                        <h3 id='likeCount'>${formatNumber(post.postSummary.likeCount)}</h3>
                        <h3>좋아요수</h3>
                    </button>
                    <button class="gray-box">
                        <h3>${formatNumber(post.postSummary.viewCount)}</h3>
                        <h3>조회수</h3>
                    </button>
                    <button class="gray-box">
                        <h3>${formatNumber(post.postSummary.commentCount)}</h3>
                        <h3>댓글</h3>
                    </button>
                </div>
                <!-- 구분선 -->
                <div style="border: 0.5px solid #c9c9c9ff"></div>
                <!-- 댓글 작성 -->
                <div class="card comment-card">
                    <form id="commentForm">
                        <div style="padding: 1.5rem 1.5rem 0rem 1.5rem; margin-top: 30px">
                            <div class="form-group">
                                <textarea 
                                    name="content" 
                                    placeholder="댓글을 남겨주세요!"
                                    rows="3"
                                    required
                                ></textarea>
                            </div>
                        </div>
                        <div style="border: 0.5px solid #c9c9c9ff"></div>
                        <div style="display: flex; flex-direction: row-reverse; padding: 10px;">
                            <button type="submit" class="btn btn-primary">댓글 등록</button>
                        </div>
                    </form>
                </div>

                <!-- 댓글 목록 -->
                <div id="commentsList">
                    ${comments.length > 0 ? 
                        comments.map(comment => createCommentHTML(comment, user)).join('') :
                        '<p style="color: #666; padding: 2rem 0; text-align: center;">첫 댓글을 작성해보세요!</p>'
                    }
                </div>
            </div>
        `;
        
        setupEventListeners(post, user, isLiked);
        
    } catch (error) {
        content.innerHTML = `
            <div class="container">
                <div class="error-message">
                    게시글을 불러오는데 실패했습니다: ${error.message}
                </div>
                <button class="btn btn-secondary" onclick="history.back()">돌아가기</button>
            </div>
        `;
    }
};

// 댓글 HTML 생성
function createCommentHTML(comment, currentUser) {
    const isAuthor = comment.mine;
    
    return `
        <div class="comment-item" data-comment-id="${comment.commentId}">
            <div style="margin: 0px 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-top:30px">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center;">
                            ${comment.authorProfileImg ? `
                                <img src="${comment.authorProfileImg}" alt="프로필" class="profile-image">
                            ` : `
                                <div class="profile-image no-image"></div>
                            `}
                            <strong>&nbsp;&nbsp;&nbsp;${escapeHtml(comment.author || '익명')}</strong>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${formatDateTime(comment.postedTime)}
                        </div>
                        <div class="comment-content" style="margin-left: 50px">
                            <p style="white-space: pre-line;">
                                ${escapeHtml(comment.content)}
                            </p>
                        </div>
                    </div>
                    ${isAuthor ? `
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-form comment-edit-btn" data-comment-id="${comment.commentId}">수정</button>
                            <button class="btn btn-form comment-delete-btn" data-comment-id="${comment.commentId}">삭제</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// 이벤트 리스너 설정
function setupEventListeners(post, user, isLiked) {
    // 수정
    document.getElementById('editBtn')?.addEventListener('click', () => {
        navigateTo(`/posts/${post.postSummary.postId}/edit`);
    });
    
    // ⭐ 게시글 삭제 (모달)
    document.getElementById('deleteBtn')?.addEventListener('click', () => {
        showModal({
            title: '게시글을 삭제하시겠습니까?',
            message: '삭제한 내용은 복구 할 수 없습니다.',
            confirmText: '확인',
            cancelText: '취소',
            onConfirm: async () => {
                try {
                    await api.deletePost(post.postSummary.postId);
                    showAlert({
                        title: '삭제 완료',
                        message: '게시글이 삭제되었습니다.'
                    });
                    setTimeout(() => navigateTo('/'), 500);
                } catch (error) {
                    showAlert({
                        title: '삭제 실패',
                        message: error.message
                    });
                }
            }
        });
    });

    // 좋아요 버튼
    document.getElementById('likeBtn')?.addEventListener('click', async () => {
        const likeBtn = document.getElementById('likeBtn');
        const likeCountEl = document.getElementById('likeCount');
        let currentCount = post.postSummary.likeCount;
        
        isLiked = !isLiked;
        
        if (isLiked) {
            likeBtn.classList.add('liked');
            currentCount++;
            likeCountEl.textContent = formatNumber(currentCount);
            await api.likePost(post.postSummary.postId);
        } else {
            likeBtn.classList.remove('liked');
            currentCount--;
            likeCountEl.textContent = formatNumber(currentCount);
            await api.unlikePost(post.postSummary.postId);
        }
        
        post.postSummary.likeCount = currentCount;
    });
    
    // 댓글 작성
    document.getElementById('commentForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const content = formData.get('content').trim();
        
        if (!content) {
            showAlert({
                title: '입력 오류',
                message: '댓글 내용을 입력해주세요.'
            });
            return;
        }
        
        try {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = '작성 중...';
            
            await api.createComment(post.postSummary.postId, content);
            
            postDetailPage({ id: post.postSummary.postId });
        } catch (error) {
            showAlert({
                title: '작성 실패',
                message: error.message
            });
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = '댓글 작성';
        }
    });
    
    // ⭐ 댓글 수정/삭제 (이벤트 위임)
    document.getElementById('commentsList')?.addEventListener('click', async (event) => {
        const commentId = event.target.dataset.commentId;
        if (!commentId) return;
        
        // 댓글 삭제
        if (event.target.classList.contains('comment-delete-btn')) {
            showModal({
                title: '댓글을 삭제하시겠습니까?',
                message: '삭제한 내용은 복구 할 수 없습니다.',
                confirmText: '확인',
                cancelText: '취소',
                onConfirm: async () => {
                    try {
                        await api.deleteComment(post.postSummary.postId, commentId);
                        postDetailPage({ id: post.postSummary.postId });
                    } catch (error) {
                        showAlert({
                            title: '삭제 실패',
                            message: error.message
                        });
                    }
                }
            });
        }
        
        // ⭐ 댓글 수정
        if (event.target.classList.contains('comment-edit-btn')) {
            const commentItem = event.target.closest('.comment-item');
            const contentDiv = commentItem.querySelector('.comment-content');
            const currentContent = contentDiv.querySelector('p').textContent.trim();
            
            // 수정 폼으로 변경
            contentDiv.innerHTML = `
                <div class="comment-edit-form" style="display: flex; align-items: flex-start">
                    <textarea id="editCommentText-${commentId}" rows="3">${currentContent}</textarea>
                    <button class="btn btn-form comment-edit-cancel" data-comment-id="${commentId}">취소</button>
                    <button class="btn btn-form comment-edit-save" data-comment-id="${commentId}">저장</button>
                </div>
            `;
            
            // 수정 버튼 숨기기
            event.target.style.display = 'none';
        }
        
        // 수정 취소
        if (event.target.classList.contains('comment-edit-cancel')) {
            postDetailPage({ id: post.postSummary.postId });
        }
        
        // 수정 저장
        if (event.target.classList.contains('comment-edit-save')) {
            const textarea = document.getElementById(`editCommentText-${commentId}`);
            const newContent = textarea.value.trim();
            
            if (!newContent) {
                showAlert({
                    title: '입력 오류',
                    message: '댓글 내용을 입력해주세요.'
                });
                return;
            }
            
            try {
                event.target.disabled = true;
                event.target.textContent = '저장 중...';
                
                await api.updateComment(post.postSummary.postId, commentId, newContent);
                
                postDetailPage({ id: post.postSummary.postId });
            } catch (error) {
                showAlert({
                    title: '수정 실패',
                    message: error.message
                });
                event.target.disabled = false;
                event.target.textContent = '저장';
            }
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}