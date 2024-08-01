import React, { useState } from "react";
import axios, { setAccessToken } from "../axiosConfig"; // 수정된 import
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import { FaUser, FaLock } from "react-icons/fa";
import { getStompClient } from "../../network/StompClient";

const LoginForm = () => {
    const [action, setAction] = useState(""); // wrapper class activate
    const [username, setUsername] = useState(""); // 로그인 사용자명
    const [password, setPassword] = useState(""); // 로그인 비밀번호
    const [registUsername, setRegistUsername] = useState(""); // 회원가입 사용자명
    const [registPassword, setRegistPassword] = useState(""); // 회원가입 비밀번호
    const [loginCheck, setLoginCheck] = useState(false); // 로그인 상태 체크

    localStorage.setItem(
        "HTTP_API_URL_PREFIX",
        "https://i11a410.p.ssafy.io/staging/api"
    );
    const navigate = useNavigate();
    const HTTP_API_URL_PREFIX = localStorage.getItem("HTTP_API_URL_PREFIX");

    const registerLink = () => {
        setAction("active");
    };

    const loginLink = () => {
        setAction("");
    };

    const startGame = () => {
        navigate("/GameStart");
    };

    const movetoRoom = async () => {
        try {
            const response = await axios.post(`/api/auth/guest/sign-up`);
            const { accessToken, userProfile, webSocketConnectionToken } =
                response.data;
            setAccessToken(accessToken);
            const stompClient = getStompClient(webSocketConnectionToken);
            sessionStorage.setItem("userProfile", JSON.stringify(userProfile));
            sessionStorage.setItem("uuid", userProfile.uuid);
            sessionStorage.setItem("nickname", userProfile.nickname);
            console.log("로그인한 게스트의 닉네임: ", userProfile.nickname);

            navigate("/Lobby", {
                state: {
                    uuid: userProfile.uuid,
                    accessToken: accessToken,
                    userProfile,
                },
            });
        } catch (err) {
            console.log(err);
        }
    };

    const onClickLogin = async (e, username, password) => {
        e.preventDefault();
        console.log(`username: ${username}`);
        console.log(`password: ${password}`);
        setLoginCheck(true); // 로그인 상태 true로 변경

        try {
            const response = await axios.post(`/api/auth/login`, {
                username,
                password,
            });
            const { accessToken, userProfile, webSocketConnectionToken } =
                response.data;
            setAccessToken(accessToken);

            navigate("/Lobby", {
                state: { userProfile, accessToken },
            });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className={`wrapper ${action}`}>
            <div className="form-box login">
                <form>
                    <h1>Login</h1>
                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="Username"
                            id="username"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <FaUser className="icon" />
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <FaLock className="icon" />
                    </div>
                    <button
                        type="submit"
                        onClick={(e) => onClickLogin(e, username, password)}
                    >
                        LOGIN
                    </button>
                    <div className="register-link">
                        <p>
                            Don't have an account?
                            <a href="#" onClick={registerLink}>
                                회원가입 하기
                            </a>
                        </p>
                    </div>
                    <button
                        className="guest"
                        type="button"
                        onClick={movetoRoom}
                    >
                        게스트 접속하기
                    </button>
                </form>
                <button onClick={startGame}>게임으로 이동</button>
            </div>

            <div className="form-box register">
                <form>
                    <h1>Registration</h1>
                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="Username"
                            id="registUsername"
                            onChange={(e) => setRegistUsername(e.target.value)}
                            required
                        />
                        <FaUser className="icon" />
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            id="registPassword"
                            onChange={(e) => setRegistPassword(e.target.value)}
                            required
                        />
                        <FaLock className="icon" />
                    </div>

                    <button
                        type="submit"
                        onClick={(e) =>
                            onClickLogin(e, registUsername, registPassword)
                        }
                    >
                        REGISTER
                    </button>
                    <div className="register-link">
                        <p>
                            Already have an account?
                            <a href="#" onClick={loginLink}>
                                Login
                            </a>
                        </p>
                    </div>

                    <button
                        className="guest"
                        type="button"
                        onClick={movetoRoom}
                    >
                        게스트 접속하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
