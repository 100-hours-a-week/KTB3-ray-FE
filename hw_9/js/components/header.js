import { getState } from '../state.js';
import { logout, isLoggedIn } from '../auth.js';
import { navigateTo } from '../router.js';

export const renderHeader = (options = {}) => {
    const header = document.getElementById('header');
    const { user, profileImage } = getState();
    const {showBackButton = false} = options;
    //const profileImage = user?.profileImage;
 
    header.innerHTML = `
        <div class="container header-content">
            ${showBackButton ? `
                <button class="back-btn" id="backBtn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
            ` : '<div style="width: 40px"></div>'}
            <p class="logo">아무 말 대잔치</p>
            
            ${isLoggedIn() ? `
                <div class="profile-menu">
                    <button class="profile-btn" id="profileBtn">
                        ${profileImage ? `
                            <img src="${profileImage}" alt="프로필" class="profile-image">
                        ` : `
                            <div class="profile-image no-image"></div>
                        `}
                    </button>
                    
                    <!-- 드롭다운 메뉴 -->
                    <div class="dropdown-menu" id="dropdownMenu">
                        <a href="/profile" data-link class="dropdown-item">
                            회원정보수정
                        </a>
                        <a href="/password/edit" data-link class="dropdown-item">
                            비밀번호수정
                        </a>
                        <button class="dropdown-item" id="logoutBtn">
                            로그아웃
                        </button>
                    </div>
                </div>
            ` : '<div style="width: 40px"></div>'}
        </div>
    `;

    // 뒤로가기 버튼
    if (showBackButton) {
        document.getElementById('backBtn')?.addEventListener('click', () => {
            window.history.back();
        });
    }

    // 프로필 버튼 (드롭다운 토글)
    if (isLoggedIn()) {
        const profileBtn = document.getElementById('profileBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        profileBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-menu')) {
                dropdownMenu?.classList.remove('show');
            }
        });
        
        // 로그아웃 버튼
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            if (confirm('로그아웃 하시겠습니까?')) {
                logout();
                navigateTo('/login');
            }
        });
    }
};
