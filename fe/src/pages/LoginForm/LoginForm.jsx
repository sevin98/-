import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";

import axios, { updateAxiosAccessToken } from "../../network/AxiosClient";
import { getStompClient } from "../../network/StompClient";
import { userRepository } from "../../repository";

import { PHASER_GAME_ROUTE_PATH } from "../../game/PhaserGame";
import { LOBBY_ROUTE_PATH } from "../Lobby/Lobby";

import "./LoginForm.css";
import "/public/rpgui/rpgui.css";

export default function LoginForm() {
    const navigate = useNavigate();

    const [action, setAction] = useState(""); // wrapper class activate
    const [username, setUsername] = useState(""); // 로그인 사용자명
    const [password, setPassword] = useState(""); // 로그인 비밀번호
    const [registUsername, setRegistUsername] = useState(""); // 회원가입 사용자명
    const [registPassword, setRegistPassword] = useState(""); // 회원가입 비밀번호

    const changeToRegisterForm = (e) => {
        e.preventDefault();
        setAction("active");
    };

    const changeToLoginForm = (e) => {
        e.preventDefault();
        setAction("");
    };

    const onStartGameBtnClicked = () => {
        navigate(PHASER_GAME_ROUTE_PATH);
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
                navigate(LOBBY_ROUTE_PATH);
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
        <div id="container" className="rpgui-cursor-default">
            <div id="logo-area">
                <img id="logo-img" src="image/logo.png" alt="logo" />
            </div>
            <div className={`wrapper ${action} `}>
                <div className="form-box login rpgui-container framed">
                    <form className="input-form">
                        <h1>Welcome!</h1>
                        <div className="input-box">
                            <FaUser className="icon" />
                            <input
                                type="text"
                                placeholder="Username"
                                id="username"
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="input-box">
                            <FaLock className="icon" />
                            <input
                                type="password"
                                placeholder="Password"
                                id="password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <button
                                className="rpgui-button"
                                onClick={(e) =>
                                    doLoginAndMoveToLobby(e, username, password)
                                }
                            >
                                LOGIN
                            </button>

                            <button
                                className="guest rpgui-button"
                                type="button"
                                onClick={onGuestLoginBtnClicked}
                            >
                                GUEST
                            </button>
                        </div>
                        <div className="register-link">
                            <button
                                className="rpgui-button"
                                onClick={changeToRegisterForm}
                            >
                                JOIN
                            </button>
                        </div>
                    </form>
                </div>
                <div className="form-box register rpgui-container framed">
                    <form className="input-form">
                        <h1>Registration</h1>
                        <div className="input-box">
                            <FaUser className="icon" />
                            <input
                                type="text"
                                placeholder="Username"
                                id="register-username"
                                onChange={(e) =>
                                    setRegistUsername(e.target.value)
                                }
                            />
                        </div>
                        <div className="input-box">
                            <FaLock className="icon" />
                            <input
                                type="password"
                                placeholder="Password"
                                id="register-password"
                                onChange={(e) =>
                                    setRegistPassword(e.target.value)
                                }
                            />
                        </div>

                        <div className="register-link">
                            <button
                                className="rpgui-button"
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
                            <button
                                className="rpgui-button"
                                onClick={changeToLoginForm}
                            >
                                Back
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export const LOGIN_FORM_ROUTE_PATH = "/";
