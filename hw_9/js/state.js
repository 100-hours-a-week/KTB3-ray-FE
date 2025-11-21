// 전역 상태
const state = {
    user: null,
    posts: [],
    currentPost: null,
    profileImage: null
};

// 구독자 (state가 변경되면 호출될 함수들)
const subscribers = [];

// 상태 가져오기
export const getState = () => state;

// 상태 업데이트
export const setState = (updates) => {
    console.log("setState 호출")
    // 상태 병합
    Object.assign(state, updates);
    
    // 모든 구독자에게 알림
    subscribers.forEach(callback => {
        try {
            callback(state);
        } catch (error) {
            console.error('Subscriber error:', error);
        }
    });
};

// 상태 변경 구독
export const subscribe = (callback) => {
    subscribers.push(callback);
    
    // 구독 해제 함수 반환
    return () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
            subscribers.splice(index, 1);
        }
    };
};

// 특정 키만 업데이트
export const updateState = (key, value) => {
    setState({ [key]: value });
};
