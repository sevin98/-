import React, { useState, useEffect, useCallback, Component } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import { FaUser, FaLock } from "react-icons/fa";

const LoginForm = () => {
    const [action, setAction] = useState("");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [registUsername, setregistUsername] = useState("");
    const [registPassword, setregistPassword] = useState("");


    const [userProfile, setUserProfile] = useState("");
    const [loginCheck, setLoginCheck] = useState(false); // 로그인 상태 체크
    const [role, setRole] = useState("");

    const HTTP_API_URL_PREFIX = "https://i11a410.p.ssafy.io/staging/api";

    const registerLink = () => {
        setAction("active");
    };
    const loginLink = () => {
        setAction("");
    };

    const navigate = useNavigate();

    //게임시작 버튼, 이후 지울것 
    const startGame  = ()=>{
        navigate("/GameStart");
    };

    // redux 에 accesTooken, userProfile, webSocketConnectionToken 저장 해두면 좋을 듯 
    // 게스트 접속 선택할 경우 로비이동
    const movetoRoom = async() => {
        try {
            await axios.post(`${HTTP_API_URL_PREFIX}/auth/guest/sign-up`)
            . then((res)=>{
                const { accessToken, userProfile, webSocketConnectionToken } = res.data
                console.log("로그인한 게스트의 닉네임: ", userProfile.nickname);
                setUserProfile(userProfile.nickname)
                navigate("/Lobby", {state:{nickname:userProfile.nickname}});
            })
        } catch (err){
            console.log(err)
        }
    };

    // 로그인 
    const onClickLogin = (e, username, password) => {
        e.preventDefault();
        console.log(`username:${username}`);
        console.log(`password:${password}`);
        setLoginCheck(true); // 로그인 상태 true로 변경
        // 로그인 axios
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
