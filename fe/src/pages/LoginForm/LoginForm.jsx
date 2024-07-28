import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import { FaUser, FaLock } from "react-icons/fa";

const LoginForm = () => {
    const [action, setAction] = useState("");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [registUsername, setregistUsername] = useState("");
    const [registPassword, setregistPassword] = useState("");

    const [loginCheck, setLoginCheck] = useState(false); // 로그인 상태 체크

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

    // 게스트 접속 선택할 경우 로비이동
    const movetoRoom = () => {
        navigate("/Lobby");
        console.log("로비로 이동");
    };

    // 로그인 버튼 누를때 콘솔창에 아이디 패스워드 출력
    const onClickLogin = (e, username, password) => {
        e.preventDefault();
        console.log(`username:${username}`);
        console.log(`password:${password}`);
        setLoginCheck(true); // 로그인 상태 true로 변경
        movetoRoom();
    };

    // loginCheck 상태 변경된 경우 콘솔창에 출력
    useEffect(() => {
        if (loginCheck) {
            console.log(loginCheck);
        }
    }, [loginCheck]);

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
