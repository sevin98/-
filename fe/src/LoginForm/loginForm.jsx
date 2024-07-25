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
