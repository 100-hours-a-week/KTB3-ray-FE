import { api } from '../api.js';
import { getState, setState } from '../state.js';
import { navigateTo } from '../router.js';
import { showModal, showAlert } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { logout } from '../auth.js';

export const profilePage = async () => {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="container">
            <div class="loading">프로필을 불러오는 중...</div>
        </div>
    `;
    
    try {
        // 프로필 정보 가져오기
        const profile = await api.getProfile();
        
        // ⭐ state에 저장 (헤더가 최신 정보 사용하도록)
        /*
        setState({ 
            user: profile.nickname,
            profileImage: profile.profileImage || null
        });
        */
        
        content.innerHTML = `
            <div class="container">
                <button class="back-btn" id="backBtn">  
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
                <div class="profile-container">
                    <h2 style="text-align: center; margin-bottom: 2rem;">회원정보수정</h2>
                    
                    <!-- 프로필 사진 -->
                    <div class="form-group">
                        <label>프로필 사진*</label>
                        
                        <div class="profile-upload-large" id="profileUpload">
                            <input 
                                type="file" 
                                id="profileImage" 
                                name="profileImage" 
                                accept="image/*"
                                style="display: none;"
                            >
                            <div class="profile-circle-large" id="profileCircle">
                                ${profile.profileImage ? `
                                    <img src="${profile.profileImage}" alt="프로필" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                                ` : `
                                    <span class="plus-icon">+</span>
                                `}
                            </div>
                            <button type="button" class="profile-change-btn" id="changePhotoBtn">변경</button>
                        </div>
                    </div>
                    
                    <form id="profileForm" novalidate>
                        <!-- 이메일 (읽기 전용) -->
                        <div class="form-group">
                            <label for="email">이메일</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value="${profile.email}"
                                readonly
                                style="background: transparent; border: none; cursor: not-allowed;"
                            >
                        </div>
                        
                        <!-- 닉네임 -->
                        <div class="form-group">
                            <label for="nickname">닉네임*</label>
                            <input 
                                type="text" 
                                id="nickname" 
                                name="nickname" 
                                value="${profile.nickname}"
                                required
                                pattern="^\\S+$"
                                data-default-helper=" "
                                data-original-nickname="${profile.nickname}"
                                class="auth-input"
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
                    
                    <!-- 회원 탈퇴 -->
                    <div style="text-align: center; margin-top: 1.5rem;">
                        <button class="link-btn" id="deleteAccountBtn">회원 탈퇴</button>
                    </div>
                </div>
            </div>
        `;
        
        setupValidation(profile.nickname);
        setupProfileHandlers(profile);
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

function setupValidation(originalNickname) {
    const form = document.getElementById('profileForm');
    const nicknameInput = document.getElementById('nickname');
    const submitBtn = document.getElementById('submitBtn');
    
    // 닉네임 중복 상태
    let isNicknameAvailable = true;  // 초기값은 true (본인 닉네임이니까)
    
    nicknameInput.addEventListener('input', () => {
        resetHelperText(nicknameInput);
        
        // 닉네임이 변경되면 중복 체크 상태 초기화
        if (nicknameInput.value !== originalNickname) {
            isNicknameAvailable = false;
        } else {
            isNicknameAvailable = true;  // 원래 닉네임이면 OK
        }
        
        checkFormValidity();
    });
    
    nicknameInput.addEventListener('blur', async () => {
        const isValid = validateInput(nicknameInput);
        
        // 닉네임이 원래와 다르고, 기본 검증 통과했으면 중복 체크
        if (isValid && nicknameInput.value !== originalNickname) {
            await checkNicknameDuplicate(nicknameInput);
        }
        
        checkFormValidity();
    });
    
    // 닉네임 중복 확인 함수
    async function checkNicknameDuplicate(input) {
        const nickname = input.value;
        const helperText = input.parentElement.querySelector('.helper-text');
        
        try {
            const response = await api.checkNickname(nickname);
            
            // 사용 가능한 닉네임
            if (!response.duplicated) {
                isNicknameAvailable = true;
                input.classList.remove('input-error');
                resetHelperText(input);
            } else {
                // 중복된 닉네임
                isNicknameAvailable = false;
                showError(input, '중복된 닉네임 입니다');
            }
        } catch (error) {
            // 중복된 닉네임
            isNicknameAvailable = false;
            showError(input, '중복된 닉네임 입니다');
        } finally {
            checkFormValidity();
        }
    }
    
    // 전체 폼 검증
    function checkFormValidity() {
        const nickname = nicknameInput.value.trim();
        let isAllValid = true;
        
        // 닉네임 체크
        if (!nickname) {
            isAllValid = false;
        }
        
        if (!nicknameInput.validity.valid) {
            isAllValid = false;
        }
        
        // 닉네임 중복 체크 통과 여부
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

// input 검증
function validateInput(input) {
    // 1. 필수 입력
    if (input.validity.valueMissing) {
        if (input.id === 'nickname') {
            showError(input, '닉네임을 입력해주세요');
        }
        return false;
    }
    
    // 2. 패턴 (띄어쓰기)
    if (input.validity.patternMismatch) {
        if (input.id === 'nickname') {
            showError(input, '띄어쓰기를 없애주세요');
        }
        return false;
    }
    
    // 3. 닉네임 길이 확인 (11자 이상)
    if (input.id === 'nickname' && input.value.length > 10) {
        showError(input, '닉네임은 최대 10자 까지 작성 가능합니다');
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

function setupProfileHandlers(profile) {
    const fileInput = document.getElementById('profileImage');
    const profileCircle = document.getElementById('profileCircle');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    
    // 변경 버튼 클릭
    changePhotoBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 파일 선택 시 미리보기
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showAlert({
                    title: '파일 크기 초과',
                    message: '이미지 크기는 5MB 이하여야 합니다.'
                });
                fileInput.value = '';
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                showAlert({
                    title: '파일 형식 오류',
                    message: '이미지 파일만 업로드 가능합니다.'
                });
                fileInput.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                profileCircle.innerHTML = `
                    <img src="${event.target.result}" alt="프로필" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                `;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 폼 제출
    const form = document.getElementById('profileForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const nicknameInput = document.getElementById('nickname');
        
        // 최종 검증
        if (!validateInput(nicknameInput)) {
            return;
        }
        
        const formData = new FormData();
        const nickname = nicknameInput.value.trim();
        
        formData.append('nickname', nickname);
        
        // 프로필 이미지 (변경된 경우만)
        const profileImage = fileInput.files[0];
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }
        
        try {
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = '수정 중...';
            
            const response = await api.updateProfile(formData);
            /*
            // 상태 업데이트 (추후 수정)
            setState({ 
                user: response.nickname,
                profileImage: response.profileImage || null
            });
            */
            // 프로필 정보 가져오기
            const profile = await api.getProfile();
        
            // state에 저장 (헤더가 최신 정보 사용하도록)
            setState({ 
                user: profile.nickname,
                profileImage: profile.profileImage || null
            });
            
            
            // ⭐ 토스트 메시지 표시
            showToast('수정완료');
            
            // 버튼 복원
            submitBtn.disabled = false;
            submitBtn.textContent = '수정하기';
            
            // 페이지 새로고침
            setTimeout(() => {
                profilePage();
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
    
    // 회원 탈퇴
    document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
        showModal({
            title: '회원탈퇴 하시겠습니까?',
            message: '작성된 게시글과 댓글은 삭제됩니다.',
            confirmText: '확인',
            cancelText: '취소',
            onConfirm: async () => {
                try {
                    await api.deleteAccount();
                    
                    showToast('회원 탈퇴가 완료되었습니다');
                    
                    setTimeout(() => {
                        logout();
                        navigateTo('/login');
                    }, 1500);
                } catch (error) {
                    showAlert({
                        title: '탈퇴 실패',
                        message: error.message
                    });
                }
            }
        });
    });
}