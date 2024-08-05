import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "./Lobby.css";
import { WAITING_ROOM_ROUTE_PATH } from "../WaitingRoom/WaitingRoom";

export default function RoomJoin() {
    const navigate = useNavigate();

    const [roomNumber, setRoomNumber] = useState("");
    const [roomPassword, setRoomPassword] = useState("");

    const handleJoinRoom = async (e) => {
        e.preventDefault();

        try {
            // 상태를 navigate 호출 시 전달
            navigate(
                `${WAITING_ROOM_ROUTE_PATH}?room-number=${roomNumber}&room-password=${roomPassword}`
            );
        } catch (error) {
            if (error.response && error.response.status === 404) {
                toast.error("해당하는 방이 없습니다.");
            } else if (error.response && error.response.status === 401) {
                toast.error("비밀번호가 틀립니다.");
            } else if (error.response && error.response.status === 403) {
                toast.error("방에 자리가 없습니다.");
            } else {
                toast.error("방 참가 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div id="container" className="rpgui-cursor-default">
            <div className="wrapper rpgui-content">
                <div className="rpgui-container framed main-frame">
                    <h2>초대받은 방의 번호와 비밀번호를 입력하세요</h2>
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
                        <button className="rpgui-button" type="submit">
                            <p>Start!</p>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export const ROOM_JOIN_ROUTE_PATH = "/RoomJoin";
