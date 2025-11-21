import { api } from '../api.js';
import { navigateTo } from '../router.js';
import { isLoggedIn } from '../auth.js';

// 새 게시글 작성
export const postNewPage = async () => {
    renderPostForm();
};

// 게시글 수정
export const postEditPage = async ({ id }) => {
    if (!isLoggedIn()) {
        alert('로그인이 필요합니다.');
        navigateTo('/login');
        return;
    }
    
    const content = document.getElementById('content');
    content.innerHTML = '<div class="container"><div class="loading">불러오는 중</div></div>';
    
    try {
        const post = await api.getPost(id);
        renderPostForm(post);
    } catch (error) {
        content.innerHTML = `
            <div class="container">
                <div class="error-message">게시글을 불러오는데 실패했습니다: ${error.message}</div>
                <button class="btn btn-secondary" onclick="history.back()">돌아가기</button>
            </div>
        `;
    }
};

// 폼 렌더링
function renderPostForm(post = null) {
    const content = document.getElementById('content');
    const isEdit = !!post;
    
    content.innerHTML = `
        <div class="container">
            <div style="max-width: 800px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <button class="back-btn" id="backBtn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>
                    <h2 style="text-align: center">${isEdit ? '게시글 수정' : '게시글 작성'}</h2>
                    <div style="width: 40px"></div>
                </div>
                <form id="postForm">
                    <div class="form-group">
                        <label for="title"><b>제목*</b></label>
                        <div style="border-top: 1px solid #c9c9c9ff; border-bottom: 1px solid #c9c9c9ff">
                            <input 
                                type="text" 
                                id="title" 
                                name="title" 
                                required
                                placeholder="제목을 입력해주세요. (최대 26글자)"
                                style="border: none"
                                value="${isEdit ? escapeHtml(post.postSummary.title) : ''}"
                            >
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="content"><b>내용*</b></label>
                        <div style="border-top: 1px solid #c9c9c9ff; border-bottom: 1px solid #c9c9c9ff">
                            <textarea 
                                id="content" 
                                name="content" 
                                required
                                placeholder="내용을 입력해주세요."
                                rows="10"
                            >${isEdit ? escapeHtml(post.postDetails.content) : ''}</textarea>
                        </div>
                    </div>
                    <!-- ⭐ Helper text for validation errors -->
                    <p class="helper-text" id="formHelperText"></p>

                    <div class="form-group">
                        <label for="content"><b>이미지</b></label>
                        <input 
                                type="file" 
                                id="postImage" 
                                name="postImage" 
                                accept="image/*"
                                style="border: none"
                            >
                    </div>
                    
                    <div style="item-aligns: center; display: flex; align-items: center; justify-content: center;">
                        <button 
                            type="submit" 
                            id="submitBtn"
                            class="btn btn-primary" 
                            style="width: max-content"
                            disabled
                        >      
                            ${isEdit ? '수정완료 🖋️' : '작성완료 🖋️'}
                        </button>
                    </div>
                </form>
                
                <div id="errorMessage"></div>
            </div>
        </div>
    `;

    setupValidation();
    
    // 폼 제출
    const form = document.getElementById('postForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const postData = {
            title: formData.get('title').trim(),
            content: formData.get('content').trim()
        };
        
        // 유효성 검사
        if (!postData.title || !postData.content) {
            showError('제목과 내용을 모두 입력해주세요.');
            return;
        }
        
        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = isEdit ? '수정 중...' : '작성 중...';
            
            let result;
            if (isEdit) {
                console.log('📦 FormData 내용:');
                for (let [key, value] of formData.entries()) {
                    console.log(`  ${key}:`, value);
                }
                result = await api.updatePost(post.postSummary.postId, formData);
                navigateTo(`/posts/${post.postSummary.postId}`);
            } else {
                result = await api.createPost(formData);
                navigateTo(`/posts/${result.postId}`);
            }
            
        } catch (error) {
            showError(error.message);
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = isEdit ? '수정 완료' : '작성 완료';
        }
    });

    // ⭐ 제목/내용 입력 시 에러 메시지 제거
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    
    titleInput.addEventListener('input', clearError);
    contentInput.addEventListener('input', clearError);

    document.getElementById('backBtn')?.addEventListener('click', () => {
        window.history.back();
    });
}

function setupValidation() {
    const form = document.getElementById('postForm');
    const inputs = form.querySelectorAll('input[required]');
    const postContent = form.querySelectorAll('textarea[required]');
    const submitBtn = document.getElementById('submitBtn');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            resetHelperText(input);
            
            checkFormValidity();
        });
        
        input.addEventListener('blur', () => {
            validateInput(input);
            checkFormValidity();
        });
    });

    postContent.forEach(postContent => {
        postContent.addEventListener('input', () => {
            resetHelperText(postContent);
            
            checkFormValidity();
        });
        
        postContent.addEventListener('blur', () => {
            validateInput(postContent);
            checkFormValidity();
        });
    });
    
    // 전체 폼 검증
    function checkFormValidity() {
        const inputs = form.querySelectorAll('input[required]');
        const postContent = form.querySelectorAll('textarea[required]');
        let isAllValid = true;
        
        inputs.forEach(input => {
            if (!input.value) {
                isAllValid = false;
                return;
            }
            
            if (!input.validity.valid) {
                isAllValid = false;
                return;
            }
        });
        postContent.forEach(input => {
            if (!input.value) {
                isAllValid = false;
                return;
            }
            
            if (!input.validity.valid) {
                isAllValid = false;
                return;
            }
        });
        
        
        // 버튼 활성화/비활성화
        if (isAllValid) {
            submitBtn.disabled = false;
            submitBtn.classList.add('active');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.remove('active');
        }
    }
    
    // 초기 상태 체크
    checkFormValidity();
}

// input 검증
function validateInput(input) {
    // 1. 필수 입력
    
    if (input.validity.valueMissing) {
        showError('제목, 내용을 모두 작성해주세요.')
        return false;
    }
    // 통과!
    resetHelperText(input);
    return true;
}

// 에러 표시 (helper text에)
// ⭐ Helper text 에러 표시 함수
function showError(message) {
    const helperText = document.getElementById('formHelperText');
    if (helperText) {
        helperText.textContent = message;
        helperText.classList.add('error');
    }
}
function clearError() {
    const helperText = document.getElementById('formHelperText');
    if (helperText) {
        helperText.textContent = '';
        helperText.classList.remove('error');
    }
}

// 기본 helper text로 복원
function resetHelperText(input) {
    const helperText = document.getElementById('formHelperText');
    input.classList.remove('input-error');
    
    if (helperText) {
        const defaultText = input.getAttribute('data-default-helper');
        if (defaultText) {
            helperText.textContent = defaultText;
        }
        helperText.classList.remove('error');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}