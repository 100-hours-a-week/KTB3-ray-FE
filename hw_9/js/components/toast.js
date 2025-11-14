// 토스트 메시지 표시
export const showToast = (message, duration = 2000) => {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 토스트 생성
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 애니메이션 시작
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 자동으로 사라지기
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
};