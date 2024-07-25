import React, { useState } from "react";
import {useNavigate} from 'react-router-dom';
import "./loginForm.css";
import { FaUser, FaLock } from "react-icons/fa";

const LoginForm = () => {
    const [action, setAction] = useState("");

    const registerLink = () => {
        setAction("active");
    };
    const loginLink = () => {
        setAction("");
    };

    const navigate = useNavigate(); 

    //간단하게 WaitingRoom으로 가는 기능. 대기실로 바로 이동 버튼을 클릭할때 실행됨
    const handleDirectToWaitingRoom = () => {
        navigate('/WaitingRoom'); // WaitingRoom 컴포넌트의 경로로 이동
        console.log('대기실로 이동');
    }; // Lobby 구현 후 세 컴포넌트를 이은 후에는 반드시 삭제 필요

    const movetoRoom = (e) =>{
        e.preventDefault();
        navigate('../Lobby/Lobby.jsx')
        console.log('로비로 이동')
        // 게스트 접속은 룸으로 바로 이동 
    }

    return (
        <div className={`wrapper ${action}`}>
            <div className="form-box login">
                <form action="">
                    <h1> Login</h1>
                    <div className="input-box">
                        <input type="text" placeholder="Username" required />
                        <FaUser className="icon" />
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            required
                        />
                        <FaLock className="icon" />
                    </div>

                    <button type="submit"> LOGIN </button>
                    <div className="register-link">
                        <p>
                            Don't have an account?
                            <a href="#" onClick={registerLink}>
                                {" "}
                                회원가입 하기{" "}
                            </a>
                        </p>
                    </div>

                    <button className="guest" type="button" onClick={movetoRoom}>
                    게스트 접속하기
                    </button>

                    //대기실로 바로이동 버튼
                    <button className="direct-to-waiting-room" onClick={handleDirectToWaitingRoom}>
                        대기실로 바로 이동
                    </button>
                    //추후 삭제 필요
                </form>
            </div>

            <div className="form-box register">
                <form action="">
                    <h1> Registration</h1>
                    <div className="input-box">
                        <input type="text" placeholder="Username" required />
                        <FaUser className="icon" />
                    </div>
                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            required
                        />
                        <FaLock className="icon" />
                    </div>

                    <button type="submit"> REGISTER </button>
                    <div className="register-link">
                        <p>
                            Already have an account?
                            <a href="#" onClick={loginLink}>
                                {" "}
                                Login{" "}
                            </a>
                        </p>
                    </div>

                    <button className="guest" type="button" onClick={movetoRoom}>
                        게스트 접속하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
