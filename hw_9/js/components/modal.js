// 모달 생성
export const showModal = ({ title, message, onConfirm, confirmText = '확인', cancelText = '취소' }) => {
    // 기존 모달 제거
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // ⭐ body 스크롤 막기
    document.body.style.overflow = 'hidden';
    
    // 모달 HTML
    const modalHTML = `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <h2 class="modal-title">${title}</h2>
                <p class="modal-message">${message}</p>
                <div class="modal-buttons">
                    <button class="modal-btn modal-btn-cancel" id="modalCancelBtn">${cancelText}</button>
                    <button class="modal-btn modal-btn-confirm" id="modalConfirmBtn">${confirmText}</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const overlay = document.getElementById('modalOverlay');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    
    // 닫기 함수
    const closeModal = () => {
        overlay.classList.add('modal-closing');
        setTimeout(() => {
            overlay.remove();
            // ⭐ body 스크롤 복원
            document.body.style.overflow = '';
        }, 200);
    };
    
    // 취소 버튼
    cancelBtn.addEventListener('click', closeModal);
    
    // 확인 버튼
    confirmBtn.addEventListener('click', () => {
        if (onConfirm) {
            onConfirm();
        }
        closeModal();
    });
    
    // 오버레이 클릭 시 닫기
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });
    
    // ESC 키로 닫기
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
};

// Alert 모달 (확인만)
export const showAlert = ({ title, message }) => {
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // ⭐ body 스크롤 막기
    document.body.style.overflow = 'hidden';
    
    const modalHTML = `
        <div class="modal-overlay" id="modalOverlay">
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <h2 class="modal-title">${title}</h2>
                <p class="modal-message">${message}</p>
                <div class="modal-buttons">
                    <button class="modal-btn modal-btn-confirm" id="modalConfirmBtn" style="width: 100%;">확인</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const overlay = document.getElementById('modalOverlay');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    
    const closeModal = () => {
        overlay.classList.add('modal-closing');
        setTimeout(() => {
            overlay.remove();
            // ⭐ body 스크롤 복원
            document.body.style.overflow = '';
        }, 200);
    };
    
    confirmBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });
};