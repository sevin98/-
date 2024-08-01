import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

import axios, { updateAxiosAccessToken } from "../../network/AxiosClient";
import { getStompClient } from "../../network/StompClient";
import { userRepository } from "../../repository";

import "./LoginForm.css";

const LoginForm = () => {
    const navigate = useNavigate();

    const [action, setAction] = useState(""); // wrapper class activate
    const [username, setUsername] = useState(""); // 로그인 사용자명
    const [password, setPassword] = useState(""); // 로그인 비밀번호
    const [registUsername, setRegistUsername] = useState(""); // 회원가입 사용자명
    const [registPassword, setRegistPassword] = useState(""); // 회원가입 비밀번호

    const registerLink = () => {
        setAction("active");
    };

    const loginLink = () => {
        setAction("");
    };

    const startGame = () => {
        navigate("/GameStart");
    };

    const onGuestLoginBtnClicked = async () => {
        axios
            .post(`/api/auth/guest/sign-up`)
            .then((resp) => {
                const { accessToken, userProfile, webSocketConnectionToken } =
                    resp.data;
                // 인증 및 사용자 정보 초기화
                updateAxiosAccessToken(accessToken);
                userRepository.setUserProfile(userProfile);

                // STOMP Client 초기화
                getStompClient(webSocketConnectionToken);

                // 로비로 이동
                navigate("/Lobby", {
                    state: {
                        uuid: userProfile.uuid,
                        accessToken,
                        userProfile,
                    },
                });
            })
            .catch((error) => {
                console.error(error);
                throw new Error("게스트 로그인 실패");
            });
    };

    const doLoginAndMoveToLobby = async (e, username, password) => {
        e.preventDefault();
        try {
            // TODO : Access token, User Profile 갱신, STOMP Client 초기화 및 /Lobby로 이동
            console.log("로그인 시도...");
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
                        onClick={(e) =>
                            doLoginAndMoveToLobby(e, username, password)
                        }
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
                        onClick={onGuestLoginBtnClicked}
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
                            doLoginAndMoveToLobby(
                                e,
                                registUsername,
                                registPassword
                            )
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
                        onClick={onGuestLoginBtnClicked}
                    >
                        게스트 접속하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export const ROUTE_PATH = "/";
export default LoginForm;
