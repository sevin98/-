import react, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import { Client } from "@stomp/stompjs";
// import NodeWebSocket from 'ws';

import "./Loby.css";

const LobbyCreate = () => {
    const navigate = useNavigate();
    
    const [roomPassword, setRoomPassword] = useState("");
    const HTTP_API_URL_PREFIX = localStorage.getItem("HTTP_API_URL_PREFIX");

    // 방 만들기
    const createRoom = async(e) => {
    e.preventDefault();
    const res = await axios.post(`${HTTP_API_URL_PREFIX}/rooms`,
        {password: roomPassword});
    sessionStorage.setItem('roomPassword',roomPassword)
    navigate("/WaitingRoom", {
        state: { roomNumber: res.data.roomNumber, topic:res.data.topic},
    });
    }

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
