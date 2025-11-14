import { api } from '../api.js';
import { navigateTo } from '../router.js';
import { renderHeader } from '../components/header.js';

export const registerPage = async () => {
    const content = document.getElementById('content');
    
    renderHeader({ showBackButton: true });
    
    content.innerHTML = `
        <div class="container">
            <div style="max-width: 500px; margin: 6rem auto;">
                <h2 style="text-align: center; margin-bottom: 2rem;">회원가입</h2>
                
                <form id="registerForm" novalidate>
                    <!-- 프로필 사진 -->
                    <div class="form-group">
                        <label>프로필 사진</label>
                        
                        <div class="profile-upload" id="profileUpload">
                            <input 
                                type="file" 
                                id="profileImage" 
                                name="profileImage" 
                                accept="image/*"
                                style="display: none;"
                            >
                            <div class="profile-circle" id="profileCircle">
                                <span class="plus-icon">+</span>
                            </div>
                        </div>
                    </div>

                    <!-- 이메일 -->
                    <div class="form-group">
                        <label for="email">이메일*</label>
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
                    
                    <!-- 닉네임 -->
                    <div class="form-group">
                        <label for="nickname">닉네임*</label>
                        <input 
                            type="text" 
                            id="nickname" 
                            name="nickname" 
                            required
                            placeholder="닉네임을 입력하세요"
                            pattern="^\\S+$"
                            class="auth-input"
                            data-default-helper=" "
                        >
                        <p class="helper-text"></p>
                    </div>
                    
                    <!-- 회원가입 버튼 -->
                    <button 
                        type="submit" 
                        id="submitBtn"
                        class="btn btn-basic" 
                        style="width: 100%; margin-top: 1rem;"
                        disabled
                    >
                        회원가입
                    </button>
                </form>
                
                <div style="text-align: center; margin-top: 1.5rem;">
                    <a href="/login" data-link>로그인하러 가기</a>
                </div>
                
                <div id="errorMessage"></div>
            </div>
        </div>
    `;
    
    setupRegisterHandlers();
    setupValidation();
};

function setupValidation() {
    const form = document.getElementById('registerForm');
    const inputs = form.querySelectorAll('input[required]');
    const submitBtn = document.getElementById('submitBtn');
    
    // 이메일, 닉네임 중복 상태 저장
    let isEmailAvailable = false;
    let isNicknameAvailable = false;
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            resetHelperText(input);
            
            // 이메일, 닉네임 입력 시 중복 체크 상태 초기화
            if (input.id === 'email') {
                isEmailAvailable = false;
            }
            if (input.id === 'nickname') {
                isNicknameAvailable = false;
            }
            
            checkFormValidity();
        });
        
        input.addEventListener('blur', () => {
            validateInput(input);
            checkFormValidity();
        });
    });
    
    // 이메일 중복 확인 (blur 시)
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', async () => {
        if (emailInput.value && emailInput.validity.valid) {
            await checkEmailDuplicate(emailInput);
        }
    });

    const nicknameInput = document.getElementById('nickname');
    nicknameInput.addEventListener('blur', async () => {
        if (nicknameInput.value && 
            nicknameInput.validity.valid && 
            nicknameInput.value.length <= 10) {  // ⭐ 수동 체크
            await checkNicknameDuplicate(nicknameInput);
        }
    })
    
    // ⭐ 이메일 중복 확인 함수
    async function checkEmailDuplicate(input) {
        const email = input.value;
        const helperText = input.parentElement.querySelector('.helper-text');
        
        try {
            helperText.textContent = ' ';
            
            const response = await api.checkEmail(email);
            
            // 사용 가능한 이메일
            if (!response.duplicated) {
                isEmailAvailable = true;
                input.classList.remove('input-error');
                input.classList.add('input-valid');
            } else {
                // 중복된 이메일
                isEmailAvailable = false;
                showError(input, '중복된 이메일 입니다');
                input.classList.add('input-error');
            }
        } catch (error) {
            // 중복된 이메일
            isEmailAvailable = false;
            showError(input, '중복된 이메일 입니다');
            input.classList.add('input-error');
        } finally {
            checkFormValidity();
        }
    }

    async function checkNicknameDuplicate(input) {
        const nickname = input.value;
        const helperText = input.parentElement.querySelector('.helper-text');
        
        try {
            helperText.textContent = ' ';
            
            const response = await api.checkNickname(nickname);
            
            // 사용 가능한 닉네임
            if (!response.duplicated) {
                isNicknameAvailable = true;
                input.classList.remove('input-error');
                input.classList.add('input-valid');
            } else {
                // 중복된 닉네임
                isNicknameAvailable = false;
                showError(input, '중복된 닉네임 입니다');
                input.classList.add('input-error');
            }
        } catch (error) {
            // 중복된 닉네임
            isNicknameAvailable = false;
            showError(input, '중복된 닉네임 입니다');
            input.classList.add('input-error');
        } finally {
            checkFormValidity();
        }
    }
    
    // 비밀번호 확인 실시간 체크
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    confirmPassword.addEventListener('input', () => {
        if (confirmPassword.value) {
            if (password.value !== confirmPassword.value) {
                showError(confirmPassword, '비밀번호가 일치하지 않습니다');
            } else {
                resetHelperText(confirmPassword);
            }
        }
        checkFormValidity();
    });
    
    // ⭐ 전체 폼 검증 (중복 체크 포함)
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
        
        // ⭐ 이메일 중복 체크 통과 여부 확인
        if (!isEmailAvailable) {
            isAllValid = false;
        }
        
        if (!isNicknameAvailable) {
            isAllValid = false;
        }

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

// 전체 폼 검증 상태 확인
function checkFormValidity() {
    const form = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');
    const inputs = form.querySelectorAll('input[required]');
    
    let isAllValid = true;
    
    inputs.forEach(input => {
        // 값이 비어있으면 invalid
        if (!input.value) {
            isAllValid = false;
            return;
        }
        
        // HTML5 validation 체크
        if (!input.validity.valid) {
            isAllValid = false;
            return;
        }
        
        // 비밀번호 확인 매칭 체크
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

// input 검증
function validateInput(input) {

    // 1. 필수 입력
    if (input.validity.valueMissing) {
        if(input.id === 'email'){
            showError(input, '이메일을 입력해주세요.');
        } else if (input.id === 'password') {
            showError(input, '비밀번호를 입력해주세요.');
        } else if (input.id === 'confirmPassword'){
            showError(input, '비밀번호를 한번 더 입력해주세요.')
        } else if (input.id === 'nickname') {
            showError(input, '닉네임을 입력해주세요.');
        }
        return false;
    }
    
    // 2. 이메일 형식
    if (input.type === 'email' && input.validity.typeMismatch) {
        showError(input, '올바른 이메일 주소 형식을 입력해주세요. (예: example@exaple.com)');
        return false;
    }

    /*

    // 3. 최소 길이
    if (input.validity.tooShort) {
        showError(input, `최소 ${input.minLength}자 이상 입력하세요`);
        return false;
    }
        */
    
    // 4. 패턴 (비밀번호, 닉네임)
    if (input.validity.patternMismatch) {
        if (input.id === 'password') {
            showError(input, '비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.');
        } else if (input.id === 'nickname') {
            showError(input, '띄어쓰기를 없애주세요');
        }
        return false;
    }
    
    // 5. 비밀번호 확인
    if (input.id === 'confirmPassword') {
        const password = document.getElementById('password').value;
        if (input.value !== password) {
            showError(input, '비밀번호가 일치하지 않습니다');
            return false;
        }
    }

    // 6. 닉네임 길이 확인
    if (input.id === 'nickname' && input.value.length > 10) {
        showError(input, '닉네임은 최대 10자 까지 작성 가능합니다.');
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

function setupRegisterHandlers() {
    const fileInput = document.getElementById('profileImage');
    const profileCircle = document.getElementById('profileCircle');
    const profileUpload = document.getElementById('profileUpload');
    
    // 프로필 원 클릭 시 파일 선택
    profileUpload.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 파일 선택 시 미리보기
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('이미지 크기는 5MB 이하여야 합니다.');
                fileInput.value = '';
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                fileInput.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                profileCircle.style.backgroundImage = `url(${event.target.result})`;
                profileCircle.style.backgroundSize = 'cover';
                profileCircle.style.backgroundPosition = 'center';
                profileCircle.querySelector('.plus-icon').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 폼 제출 처리
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
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
        
        if (password !== confirmPassword) {
            showError(document.getElementById('confirmPassword'), '비밀번호가 일치하지 않습니다');
            return;
        }
        
        try {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = '가입 중...';
            
            const signupData = new FormData();
            signupData.append('email', formData.get('email'));
            signupData.append('password', password);
            signupData.append('nickname', formData.get('nickname'));
            
            const profileImage = formData.get('profileImage');
            if (profileImage && profileImage.size > 0) {
                signupData.append('profileImage', profileImage);
            }
            
            console.log('📤 전송할 데이터:');
            for (let [key, value] of signupData.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}:`, value.name, value.size, 'bytes');
                } else {
                    console.log(`  ${key}:`, value);
                }
            }

            await api.register(signupData);
            
            showSuccess('회원가입 성공! 로그인 페이지로 이동합니다.');
            
            setTimeout(() => {
                navigateTo('/login');
            }, 2000);
            
        } catch (error) {
            showGlobalError(error.message);
            
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = false;
            submitBtn.textContent = '회원가입';
            checkFormValidity(); // 버튼 상태 복원
        }
    });
    
    function showGlobalError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.innerHTML = `<div class="error-message">${message}</div>`;
    }
    
    function showSuccess(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.innerHTML = `<div class="success-message">${message}</div>`;
    }
}