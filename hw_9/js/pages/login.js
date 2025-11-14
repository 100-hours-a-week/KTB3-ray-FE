import { api } from '../api.js';
import { setToken } from '../auth.js';
import { setState } from '../state.js';
import { navigateTo } from '../router.js';

export const loginPage = async () => {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="container">
            <div style="max-width: 500px; margin: 6rem auto;">
                <h2 style="text-align: center;">로그인</h2>
                
                <form id="loginForm" style="margin-top:30px" novalidate>
                    <div class="form-group">
                        <label for="email">이메일</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            required
                            placeholder="이메일을 입력하세요"
                            class="auth-input"
                            data-default-helper=" "
                        >
                        <p class="helper-text"></p>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">비밀번호</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            required
                            placeholder="비밀번호를 입력하세요"
                            class="auth-input"
                            data-default-helper=" "
                        >
                        <p class="helper-text"></p>
                    </div>
                    
                    <button 
                        type="submit" 
                        id="submitBtn"
                        class="btn btn-basic" 
                        style="width: 100%; margin-top: 1rem;"
                        disabled
                    >                    
                        로그인
                    </button>
                </form>
                
                <div style="text-align: center; margin-top: 1rem;">
                    <a href="/register" data-link>회원가입</a>
                </div>
                
                <div id="errorMessage"></div>
            </div>
        </div>
    `;
    
    setupLoginHandlers()
    setupValidation();
};

function setupValidation() {
    const form = document.getElementById('loginForm');
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
    
    // 2. 이메일 형식
    if (input.type === 'email' && (input.validity.typeMismatch || input.validity.valueMissing)) {
        showError(input, '올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)');
        return false;
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

function setupLoginHandlers() {
    
    // 폼 제출 처리
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        // 최종 검증
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showGlobalError('입력값을 확인해주세요');
            return;
        }
        
        try {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = '로그인 중..';
            
            const response = await api.login(credentials);
            
            // 토큰 저장
            setToken(response.accessToken);
            
            const userResponse = await api.getProfile();

            // 사용자 정보 상태에 저장
            setState({ 
                user: userResponse.nickname,
                profileImage: userResponse.profileImage || null
            });
            // 메인 페이지로 이동
            navigateTo('/');
            
        } catch (error) {
            showGlobalError(error.message);
            
            // 버튼 복구
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = '로그인';
        }
    });
    
    function showGlobalError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.innerHTML = `<div class="error-message">${message}</div>`;
    }
}