import { api } from '../api.js';
import { navigateTo } from '../router.js';
import { getState } from '../state.js';
import { isLoggedIn } from '../auth.js';
import { formatDateTime, formatNumber } from '../fromatter.js';
import { showModal, showAlert } from '../components/modal.js';  // ⭐ 추가

export const postDetailPage = async ({ id }) => {
    const content = document.getElementById('content');
    
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
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0px 10px 10px10px">
                    <button class="back-btn" id="backBtn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>
                    <div style="display: flex; align-items: center; margin: auto; font-size: 20px">
                        ${post.postSummary.authorProfileImg ? `
                            <img src="${post.postSummary.authorProfileImg}" alt="프로필" class="profile-image">
                        ` : `
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <rect width="40" height="40" rx="20" fill="#2b2b2b"/>
                                <circle cx="20.197" cy="11.9212" r="6.00985" fill="white"/>
                                <path d="M31.5271 32.0197C31.5271 30.48 31.2315 28.9555 30.6571 27.533C30.0828 26.1106 29.241 24.8181 28.1797 23.7295C27.1185 22.6408 25.8586 21.7772 24.472 21.188C23.0854 20.5988 21.5993 20.2955 20.0985 20.2955C18.5977 20.2955 17.1115 20.5988 15.725 21.188C14.3384 21.7772 13.0785 22.6408 12.0173 23.7295C10.956 24.8181 10.1142 26.1106 9.53987 27.533C8.96553 28.9555 8.66992 30.48 8.66992 32.0197L20 32L31.5271 32.0197Z" fill="white"/>
                            </svg>
                        `}
                        <strong>&nbsp;&nbsp;&nbsp;${escapeHtml(post.postSummary.author || '익명')}</strong>
                    </div>
                    <div style="width: 40px;"></div>
                </div>
                <!-- 구분선 -->
                <div style="border: 0.5px solid #c9c9c9ff; margin: 20px 0px 10px 0px;"></div>
                <!-- 게시글 -->
                <div class="non-post-card" style="margin-top: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">                            
                        <h1>${escapeHtml(post.postSummary.title)}</h1>
                        ${isAuthor ? `
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-form" id="editBtn">수정</button>
                                <button class="btn btn-form" id="deleteBtn">삭제</button>
                            </div>
                        ` : ''}
                    </div>
                    <!-- 게시글 내용 -->
                    <div style="padding-bottom: 30px">
                        ${post.postDetails.imgUrl ? `
                            <img src="${post.postDetails.imgUrl}" style="width: 600px; padding-top: 20px">
                        ` : ""}
                        <div style="white-space: pre-line; line-height: 1.8;">
                            ${escapeHtml(post.postDetails.content)}
                        </div>
                    </div>
                    <!-- 좋아요, 조회수, 댓글 -->
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center" class="post-meta">
                            <button class="heart ${isLiked ? 'liked' : ''}" style="border: none" id="newLikeBtn" ></button>
                            <p id="newLikeCount" style="margin-left: 5px; font-size: 15px;">${escapeHtml(formatNumber(post.postSummary.likeCount))}</p>
                            <button class="comment" style="border: none; margin-left: 20px"></button>
                            <p id="commentCount" style="margin-left: 5px; font-size: 15px;">${escapeHtml(formatNumber(post.postSummary.commentCount))}</p>
                            <button class="view" style="border: none; margin-left: 20px"></button>
                            <p style="margin-left: 5px; font-size: 15px;">${escapeHtml(formatNumber(post.postSummary.viewCount))}</p>

                        </div>
                        <p class="post-meta">${formatDateTime(post.postSummary.postedTime)}</p>
                    </div>           
                </div>
                <!-- 댓글 작성 -->
                <div class="round-card" style="margin-top: 25px">
                    <form id="commentForm" style="display: flex; align-items: center; justify-content: space-between">
                        <div class="form-group">
                            <textarea 
                                name="content" 
                                placeholder="댓글을 남겨주세요!"
                                rows="3"
                                required
                                style="width: 550px; height: 48px"
                            ></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <p>🖋️</p>
                        </button>
                    </form>
                </div>

                <!-- 댓글 목록 -->
                <div id="commentsList">
                    ${comments.length > 0 ? 
                        comments.map(comment => createCommentHTML(comment)).join('') :
                        '<p id="no-comment" style="color: #666; padding: 2rem 0; text-align: center;">첫 댓글을 작성해보세요!</p>'
                    }
                </div>
            </div>
        `;
        
        setupEventListeners(post, isLiked);
        
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
function createCommentHTML(comment) {
    const isAuthor = comment.mine;
    
    return `
        <div class="comment-item" data-comment-id="${comment.commentId}">
            <!-- 구분선 -->
            <div style="border: 0.5px solid #c9c9c9ff; margin-top: 20px"></div>
            <div style="margin: 0px 30px;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-top:30px">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center;">
                            ${comment.authorProfileImg ? `
                                <img src="${comment.authorProfileImg}" alt="프로필" class="profile-image">
                            ` : `
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                    <rect width="40" height="40" rx="20" fill="#2b2b2b"/>
                                    <circle cx="20.197" cy="11.9212" r="6.00985" fill="white"/>
                                    <path d="M31.5271 32.0197C31.5271 30.48 31.2315 28.9555 30.6571 27.533C30.0828 26.1106 29.241 24.8181 28.1797 23.7295C27.1185 22.6408 25.8586 21.7772 24.472 21.188C23.0854 20.5988 21.5993 20.2955 20.0985 20.2955C18.5977 20.2955 17.1115 20.5988 15.725 21.188C14.3384 21.7772 13.0785 22.6408 12.0173 23.7295C10.956 24.8181 10.1142 26.1106 9.53987 27.533C8.96553 28.9555 8.66992 30.48 8.66992 32.0197L20 32L31.5271 32.0197Z" fill="white"/>
                                </svg>
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
function setupEventListeners(post, isLiked) {
    document.getElementById('backBtn')?.addEventListener('click', () => {
        window.history.back();
    });
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
    document.getElementById('newLikeBtn')?.addEventListener('click', async () => {
        const likeBtn = document.getElementById('newLikeBtn');
        const likeCountEl = document.getElementById('newLikeCount');

        let currentCount = post.postSummary.likeCount;
        try {
            if (!isLiked) {
                await api.likePost(post.postSummary.postId);
                isLiked = !isLiked;
                likeBtn.classList.add('liked');
                currentCount++;
                likeCountEl.textContent = formatNumber(currentCount);
            } else {
                await api.unlikePost(post.postSummary.postId);
                isLiked = !isLiked;
                likeBtn.classList.remove('liked');
                currentCount--;
                likeCountEl.textContent = formatNumber(currentCount);
            }
            post.postSummary.likeCount = currentCount;
        } catch (error) {
            showAlert({
                title: '좋아요 작업 실패',
                message: error.message
            });
        }
    })
    
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
        const submitBtn = event.target.querySelector('button[type="submit"]');
        try {
            submitBtn.disabled = true;
            const newComment = await api.createComment(post.postSummary.postId, content);
            document.getElementById('commentsList').insertAdjacentHTML('beforeend' ,createCommentHTML(newComment));
            event.target.reset();
            const changeComment = document.getElementById("commentCount");
            changeComment.textContent = formatNumber(post.postSummary.commentCount + 1);
            document.getElementById('no-comment')?.remove();
            post.postSummary.commentCount = post.postSummary.commentCount +1;
        } catch (error) {
            showAlert({
                title: '작성 실패',
                message: error.message
            });            
        } finally {
            submitBtn.disabled = false;
        }
    });
    
    // ⭐ 댓글 수정/삭제 (이벤트 위임)
    document.getElementById('commentsList')?.addEventListener('click', async (event) => {
        const commentId = event.target.dataset.commentId;
        if (!commentId) return;
        
        const commentItem = event.target.closest('.comment-item');
        const contentDiv = commentItem.querySelector('.comment-content');

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
                        commentItem.remove();
                        const changeComment = document.getElementById("commentCount");
                        changeComment.textContent = formatNumber(post.postSummary.commentCount -1);
                        const commentsList = document.getElementById('commentsList');
                        if (commentsList.children.length === 0) {
                            commentsList.innerHTML = '<p id="no-comment" style="color: #666; padding: 2rem 0; text-align: center;">첫 댓글을 작성해보세요!</p>';
                        }
                        post.postSummary.commentCount = post.postSummary.commentCount -1;
                    } catch (error) {
                        showAlert({
                            title: '삭제 실패',
                            message: error.message
                        });
                    }
                }
            });
            return;
        }
        
        // 여기서부터 수정 시작

        // 댓글 수정
        if (event.target.classList.contains('comment-edit-btn')) {
            const currentContent = contentDiv.querySelector('p').textContent.trim();
            // 원래 내용 저장
            commentItem.dataset.originalContent = currentContent;
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
            return;
        }
        
        // 수정 취소
        if (event.target.classList.contains('comment-edit-cancel')) {
            const originalContent = commentItem.dataset.originalContent;
            contentDiv.innerHTML = `
                <p style="white-space: pre-line;">
                    ${escapeHtml(originalContent)}
                </p>
            `
            const editBtn = commentItem.querySelector('.comment-edit-btn');
            if (editBtn) {
                editBtn.style.display = 'block';
            }

            return;
        }
        
        // 수정 저장
        if (event.target.classList.contains('comment-edit-save')) {
            const textarea = document.getElementById(`editCommentText-${commentId}`);
            const newContent = textarea.value.trim();
            let originalContent = commentItem.dataset.originalContent;
            if (!newContent) {
                showAlert({
                    title: '입력 오류',
                    message: '댓글 내용을 입력해주세요.'
                });
                return;
            }
            
            try {
                event.target.disabled = true;

                if (newContent !== originalContent) {
                    // 내용 바뀌었을때만 api 호출
                    await api.updateComment(post.postSummary.postId, commentId, newContent);
                    originalContent = newContent;
                }
                
            } catch (error) {
                showAlert({
                    title: '수정 실패',
                    message: error.message
                });
            } finally {
                contentDiv.innerHTML = `
                    <p style="white-space: pre-line;">
                        ${escapeHtml(originalContent)}
                    </p>
                `
                event.target.disabled = false;
                const editBtn = commentItem.querySelector('.comment-edit-btn');
                if (editBtn) {
                    editBtn.style.display = 'block';
                }
            }
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
