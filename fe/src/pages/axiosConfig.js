import axios from "axios";

const instance = axios.create({
    baseURL: "https://i11a410.p.ssafy.io/staging",
});

// 요청 인터셉터
instance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("accessToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (선택적)
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // 토큰이 만료되었거나 유효하지 않은 경우 처리
            // 예: 로그아웃 처리 또는 토큰 갱신 로직
        }
        return Promise.reject(error);
    }
);

export function setAccessToken(token) {
    sessionStorage.setItem("accessToken", token);
}

export default instance;
