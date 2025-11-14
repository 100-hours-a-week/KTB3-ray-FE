import { setState } from './state.js';

// 토큰 저장
export const setToken = (token) => {
    localStorage.setItem('token', token);
};

// 토큰 가져오기
export const getToken = () => {
    return localStorage.getItem('token');
};

// 토큰 삭제
export const removeToken = () => {
    localStorage.removeItem('token');
};

// 로그인 확인
export const isLoggedIn = () => {
    return !!getToken();
};

// 로그아웃
export const logout = () => {
    removeToken();
    setState({ user: null });
};

// JWT 토큰에서 사용자 정보 추출
export const getUserFromToken = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
        // JWT는 "header.payload.signature" 형태
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (error) {
        console.error('토큰 파싱 실패:', error);
        return null;
    }
};
