import React, { useState, useEffect, useCallback, Component } from "react";
import axios, { setAccessToken } from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import { FaUser, FaLock } from "react-icons/fa";
// import Stomp from "@stomp/stompjs";
import { Client } from "@stomp/stompjs";

const LoginForm = () => {
    const [action, setAction] = useState(""); // wrapper class activate

    const [username, setUsername] = useState(""); //회원 가입
    const [password, setPassword] = useState("");
    const [registUsername, setregistUsername] = useState(""); // 등록
    const [registPassword, setregistPassword] = useState("");

    const [loginCheck, setLoginCheck] = useState(false); // 로그인 상태 체크

    localStorage.setItem(
        "HTTP_API_URL_PREFIX",
        "https://i11a410.p.ssafy.io/staging/api"
    );
    const navigate = useNavigate();
    const HTTP_API_URL_PREFIX = localStorage.getItem("HTTP_API_URL_PREFIX");

    const getStompClientWith = (token) => {
        return new Client({
            brokerURL: `wss://i11a410.p.ssafy.io/staging/ws?token=${token}`,
            debug: (str) => {
                console.log(`debug: ${str}`);
            },
            onConnect: async () => {
                console.log("서버 연결 완료");
            },
        });
    };

    const registerLink = () => {
        setAction("active");
    };
    const loginLink = () => {
        setAction("");
    };

    //게임시작 버튼, 이후 지울것
    const startGame = () => {
        navigate("/GameStart");
    };

    let client;

    // redux 에 accesTooken, userProfile, webSocketConnectionToken 저장 해두면 좋을 듯
    // 게스트 접속 선택할 경우 로비이동
    const movetoRoom = async () => {
        try {
            await axios
                .post(`${HTTP_API_URL_PREFIX}/auth/guest/sign-up`)
                .then((res) => {
                    const {
                        accessToken,
                        userProfile,
                        webSocketConnectionToken,
                    } = res.data;
                    setAccessToken(accessToken);
                    console.log(accessToken)
                    // userProfile만 스토리지 저장
                    sessionStorage.setItem("userProfile", userProfile);
                    sessionStorage.setItem("uuid", res.data.userProfile.uuid);

                    console.log(
                        "로그인한 게스트의 닉네임: ",
                        res.data.userProfile.nickname
                    );
                    client = getStompClientWith(webSocketConnectionToken);
                    client.activate(); //서버 연결
                    navigate("/Lobby", {
                        state: { nickname: res.data.userProfile.nickname},
                    });
                });
        } catch (err) {
            console.log(err);
        }
    };

    // 로그인
    const onClickLogin = (e, username, password) => {
        e.preventDefault();
        console.log(`username:${username}`);
        console.log(`password:${password}`);
        setLoginCheck(true); // 로그인 상태 true로 변경
        // 로그인 axios
        // client.activate();
    };

    return (
        <div className={`wrapper ${action}`}>
            <div className="form-box login">
                <form action="">
                    <h1> Login</h1>
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
                        {" "}
                        LOGIN{" "}
                    </button>
                    <div className="register-link">
                        <p>
                            Don't have an account?
                            <a href="#" onClick={registerLink}>
                                {" "}
                                회원가입 하기{" "}
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
                <form action="">
                    <h1> Registration</h1>
                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="Username"
                            id="registUsername"
                            onChange={(e) => setregistUsername(e.target.value)}
                            required
                        />
                        <FaUser className="icon" />
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            id="registPassword"
                            onChange={(e) => setregistPassword(e.target.value)}
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
                        {" "}
                        REGISTER{" "}
                    </button>
                    <div className="register-link">
                        <p>
                            Already have an account?
                            <a href="#" onClick={loginLink}>
                                {" "}
                                Login{" "}
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
