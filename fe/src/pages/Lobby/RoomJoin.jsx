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
        navigate(
            `${WAITING_ROOM_ROUTE_PATH}?room-number=${roomNumber}&room-password=${roomPassword}`
        );
    };

    return (
        <div className="wrapper">
            <form onSubmit={handleJoinRoom}>
                <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="방 번호"
                    required
                />
                <input
                    type="password"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    placeholder="비밀번호"
                />
                <button type="submit">방 참가</button>
            </form>
        </div>
    );
}

export const ROOM_JOIN_ROUTE_PATH = "/RoomJoin";
