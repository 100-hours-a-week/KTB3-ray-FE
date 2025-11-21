// API 기본 URL
const API_URL = 'http://localhost:8080';

// 토큰 가져오기
const getToken = () => localStorage.getItem('token');

// 기본 fetch 래퍼 함수
const request = async (endpoint, options = {}) => {
    const token = getToken();
    
    // FormData 체크
    const isFormData = options.body instanceof FormData;
    
    const config = {
        headers: {
            // FormData일 때는 Content-Type 설정 안 함!
            ...(!isFormData && { 'Content-Type': 'application/json' }),
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options,
        // FormData가 아닐 때만 JSON.stringify
        body: options.body && !isFormData 
            ? JSON.stringify(options.body) 
            : options.body
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        // 응답 상태 체크
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: '요청 실패' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        // 204 No Content 처리
        if (response.status === 204) {
            return null;
        }
        
        const result = await response.json();
        
        // 백엔드가 data 안에 실제 데이터를 넣어서 보내는 경우 처리
        return result.data || result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// API 함수들
export const api = {
    // 인증
    login: (credentials) => request('/auth/login', {
        method: 'POST',
        body: credentials  // JSON 또는 FormData 자동 감지
    }),
    
    register: (userData) => request('/auth/signup', {
        method: 'POST',
        body: userData  // JSON 또는 FormData 자동 감지
    }),
    
    // 게시글
    getPosts: () => request('/posts'),
    
    getPost: (id) => request(`/posts/${id}`),
    
    createPost: (postData) => request('/posts', {
        method: 'POST',
        body: postData  // JSON 또는 FormData 자동 감지
    }),
    
    updatePost: (id, postData) => request(`/posts/${id}`, {
        method: 'PATCH',
        body: postData  // JSON 또는 FormData 자동 감지
    }),
    
    deletePost: (id) => request(`/posts/${id}`, {
        method: 'DELETE'
    }),

    // 좋아요
    likePost: (postId) => request(`/posts/${postId}/like`, {
        method: 'POST'
    }),
    unlikePost: (postId) => request(`/posts/${postId}/like`, {
        method: 'DELETE'
    }),
    
    // 댓글
    getComments: (postId) => request(`/posts/${postId}/comments`),
    
    createComment: (postId, content) => request(`/posts/${postId}/comments`, {
        method: 'POST',
        body: { content }  // 객체는 자동으로 JSON.stringify
    }),
    
    deleteComment: (postId, commentId) => request(`/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE'
    }),

    updateComment: (postId, commentId, content) => request(`/posts/${postId}/comments/${commentId}`, {
        method: 'PATCH',
        body: { content }
    }),
    
    // 파일 업로드 (FormData 사용)
    uploadImage: (formData) => request('/upload/image', {
        method: 'POST',
        body: formData  // FormData 자동 감지
    }),
    
    createPostWithImage: (formData) => request('/posts', {
        method: 'POST',
        body: formData  // FormData 자동 감지
    }),
    
    updatePostWithImage: (id, formData) => request(`/posts/${id}`, {
        method: 'PATCH',
        body: formData  // FormData 자동 감지
    }),

    // 멤버
    updateProfile: (formData) => request(`/users/profile`, {
        method: 'PATCH',
        body: formData
    }),

    updatePassword: (password) => request(`/users/password`, {
        method: 'PATCH',
        body: { password }
    }),

    getProfile: () => request(`/users/my-profile`),

    checkNickname: (nickname) => request(`/users/nickname/duplicate-check?nickname=${encodeURIComponent(nickname)}`,{
        method: 'GET'
    }),
    checkEmail: (email) => request(`/users/email/duplicate-check?email=${encodeURIComponent(email)}`, {
        method: 'GET'
    })

};