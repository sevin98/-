import react, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
// import NodeWebSocket from 'ws';

import "./Loby.css";

const LobbyCreate = () => {
    const navigate = useNavigate();
    const [roomPassword, setRoomPassword] = useState("");
    const HTTP_API_URL_PREFIX = localStorage.getItem("HTTP_API_URL_PREFIX");
    const accessToken = localStorage.getItem("accessToken");

    // 방 만들기
    const createRoom = async(e) => {
    e.preventDefault();
    await axios.post(`${HTTP_API_URL_PREFIX}/rooms`,
        {password: roomPassword,},
        {headers: {Authorization: `Bearer ${accessToken}`,},}
    ).data;
    localStorage.setItem('roomPassword',roomPassword)
    console.log('룸 비밀번호 :',roomPassword)
    navigate("/WaitingRoom")
    };

    return (
        <div className="wrapper">
            <h1>방 생성</h1>
            <form action="">
                <input
                    className="input-box"
                    type="password"
                    placeholder="방 비밀번호 생성"
                    id="roomPassword"
                    onChange={(e) => setRoomPassword(e.target.value)}
                ></input>
                <p style={{ color: "red" }}>
                    *비밀번호가 없으면 공개 방으로 생성 됩니다
                </p>

                <button type="submit" onClick={createRoom}>
                    <p>방 만들기 </p>
                </button>
            </form>
        </div>
    );
};

export default LobbyCreate;
