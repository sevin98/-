import axios from "axios";

// accessToken을 설정하는 함수
export const setAccessToken = (accessToken) => {
    if (accessToken) {
        axios.defaults.headers.common[
            "Authorization"
        ] = `Bearer ${accessToken}`;
        sessionStorage.setItem("accessToken", accessToken); // 토큰을 세션 스토리지에 저장
    } else {
        delete axios.defaults.headers.common["Authorization"];
        sessionStorage.removeItem("accessToken"); // 토큰을 세션 스토리지에서 제거
    }
};

export default axios;
