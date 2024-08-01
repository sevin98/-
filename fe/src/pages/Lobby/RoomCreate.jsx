import react, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../axiosConfig";


import "./Loby.css";

const RoomCreate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userProfile = location.state?.userProfile || {};
    const [roomPassword, setRoomPassword] = useState("");

    // 방 만들기
    const createRoom = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`/api/rooms`, {
                password: roomPassword,
            });
            const roomNumber = res.data.roomNumber;
            sessionStorage.setItem("roomNumber", roomNumber);

            const { roomSubscriptionInfo, playerSubscriptionInfo } = (
                await axios.post(`/api/rooms/${roomNumber}/join`, {
                    password: roomPassword,
                })
            ).data;

            navigate("/WaitingRoom", {
                state: {
                    roomNumber: res.data.roomNumber,
                    topic: res.data.topic,
                    roomSubscriptionInfo,
                    playerSubscriptionInfo,
                    userProfile,
                },
            });
        } catch (error) {
            console.error("방 생성 중 오류가 발생했습니다:", error);
        }
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

export default RoomCreate;
