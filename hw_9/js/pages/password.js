import { api } from '../api.js';
import { getState, setState } from '../state.js';
import { navigateTo } from '../router.js';
import { showModal, showAlert } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { logout } from '../auth.js';

export const passwordEditPage = async () => {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="container">
            <div class="loading">비밀번호 불러오는 중...</div>
        </div>
    `;
    
    try {
        // 프로필 정보 가져오기
        const profile = await api.getProfile();
        
        content.innerHTML = `
            <div class="container">
                <button class="back-btn" id="backBtn">  
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
                <div class="profile-container">
                    
                    <h2 style="text-align: center; margin-bottom: 2rem;">비밀번호 수정</h2>
                    
                    <form id="passwordForm" novalidate>
                        <!-- 비밀번호 -->
                        <div class="form-group">
                            <label for="password">비밀번호*</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                required
                                placeholder="비밀번호를 입력하세요"
                                minlength="8"
                                maxlength="20"
                                pattern="^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,20}$"
                                class="auth-input"
                                data-default-helper=" "
                            >
                            <p class="helper-text"></p>
                        </div>
                        
                        <!-- 비밀번호 확인 -->
                        <div class="form-group">
                            <label for="confirmPassword">비밀번호 확인*</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                required
                                placeholder="비밀번호를 한번 더 입력하세요"
                                class="auth-input"
                                data-default-helper=" "
                            >
                            <p class="helper-text"></p>
                        </div>
                        
                        <!-- 수정하기 버튼 -->
                        <button 
                            type="submit" 
                            class="btn btn-basic" 
                            style="width: 100%; margin-top: 1rem;" 
                            id="submitBtn"
                            disabled
                        >
                            수정하기
                        </button>
                    </form>
                    
                </div>
            </div>
        `;
        
        setupValidation();
        setupFormHandler();
        document.getElementById('backBtn')?.addEventListener('click', () => {
            window.history.back();
        });
        
    } catch (error) {
        content.innerHTML = `
            <div class="container">
                <div class="error-message">
                    프로필을 불러오는데 실패했습니다: ${error.message}
                </div>
                <button class="btn btn-secondary" onclick="history.back()">돌아가기</button>
            </div>
        `;
    }
};

function setupValidation() {
    const form = document.getElementById('passwordForm');
    const inputs = form.querySelectorAll('input[required]');
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
    
    // 비밀번호 확인 실시간 체크
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    confirmPassword.addEventListener('input', () => {
        if (confirmPassword.value) {
            if (password.value !== confirmPassword.value) {
                showError(confirmPassword, '비밀번호와 다릅니다');
            } else {
                resetHelperText(confirmPassword);
            }
        }
        checkFormValidity();
    });
    
    // 전체 폼 검증
    function checkFormValidity() {
        const inputs = form.querySelectorAll('input[required]');
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
            
            if (input.id === 'confirmPassword') {
                const password = document.getElementById('password').value;
                if (input.value !== password) {
                    isAllValid = false;
                    return;
                }
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
        if (input.id === 'password') {
            showError(input, '비밀번호를 입력해주세요');
        } else if (input.id === 'confirmPassword'){
            showError(input, '비밀번호를 한번 더 입력해주세요');
        }
        return false;
    }
    
    // 2. 패턴 (비밀번호)
    if (input.validity.patternMismatch) {
        if (input.id === 'password') {
            showError(input, '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.');
        }
        return false;
    }
    
    // 3. 비밀번호 확인
    if (input.id === 'confirmPassword') {
        const password = document.getElementById('password').value;
        if (input.value !== password) {
            showError(input, '비밀번호와 다릅니다');
            return false;
        }
    }
    
    // 통과!
    resetHelperText(input);
    return true;
}

// 에러 표시 (helper text에)
function showError(input, message) {
    const helperText = input.parentElement.querySelector('.helper-text');
    input.classList.add('input-error');
    
    if (helperText) {
        helperText.textContent = message;
        helperText.classList.add('error');
    }
}

// 기본 helper text로 복원
function resetHelperText(input) {
    const helperText = input.parentElement.querySelector('.helper-text');
    input.classList.remove('input-error');
    
    if (helperText) {
        const defaultText = input.getAttribute('data-default-helper');
        if (defaultText) {
            helperText.textContent = defaultText;
        }
        helperText.classList.remove('error');
    }
}

function setupFormHandler() {
    // 폼 제출
    const form = document.getElementById('passwordForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const password = formData.get('password').trim();
        const confirmPassword = formData.get('confirmPassword').trim();
        
        // 최종 검증
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            return;
        }
        
        if (password !== confirmPassword) {
            showError(document.getElementById('confirmPassword'), '비밀번호와 다릅니다');
            return;
        }
        
        try {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = '수정 중...';
            
            const response = await api.updatePassword(password);
            
            // ⭐ 토스트 메시지 표시
            showToast('수정완료');
            
            // 버튼 복원
            submitBtn.disabled = false;
            submitBtn.textContent = '수정하기';
            
            // 페이지 새로고침
            setTimeout(() => {
                passwordEditPage();
            }, 1000);
            
        } catch (error) {
            showAlert({
                title: '수정 실패',
                message: error.message
            });
            
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
            submitBtn.textContent = '수정하기';
        }
    });
}