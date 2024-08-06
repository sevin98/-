import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../network/AxiosClient";

import "./Lobby.css";
import { WAITING_ROOM_ROUTE_PATH } from "../WaitingRoom/WaitingRoom";

export default function RoomJoin() {
    const navigate = useNavigate();

    const [roomNumber, setRoomNumber] = useState("");
    const [roomPassword, setRoomPassword] = useState("");

    const handleJoinRoom = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`/api/rooms/${roomNumber}/join`, {
                password: roomPassword,
            });

            if (res.status === 200) {
                navigate(
                    `${WAITING_ROOM_ROUTE_PATH}?room-number=${roomNumber}&room-password=${roomPassword}`
                );
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    toast.error("해당하는 방이 없습니다.");
                } else if (error.response.status === 401) {
                    toast.error("비밀번호가 틀립니다.");
                } else if (error.response.status === 409) {
                    toast.error("이미 8명이 참가한 방입니다.");
                } else {
                    toast.error("방 참가 중 오류가 발생했습니다.");
                }
            } else if (error.request) {
                toast.error("서버로부터 응답을 받지 못했습니다.");
            } else {
                toast.error("요청을 보내는 중 오류가 발생했습니다.");
            }
        }
    };

    return (
       <div id="container" className="rpgui-cursor-default">
            <div className="wrapper rpgui-content">
                <div className="rpgui-container framed main-frame">
                    <form onSubmit={handleJoinRoom}>
                        <input
                            className="input-box"
                            type="text"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="방 번호"
                            required
                        />
                        <input
                            className="input-box"
                            type="password"
                            value={roomPassword}
                            onChange={(e) => setRoomPassword(e.target.value)}
                            placeholder="비밀번호"
                        />
                        <button
                            className="rpgui-button"
                            type="submit">
                            <p>JOIN!</p>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export const ROOM_JOIN_ROUTE_PATH = "/RoomJoin";
