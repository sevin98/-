import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../../network/AxiosClient";
import { userRepository } from "../../repository";
import { WAITING_ROOM_ROUTE_PATH } from "../WaitingRoom/WaitingRoom";

import "./Lobby.css";

export default function RoomCreate() {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(
        userRepository.getUserProfile()
    );
    const [roomPassword, setRoomPassword] = useState("");

    useEffect(() => {
        if (userProfile === null) {
            console.error("유저 정보가 없습니다.");
            navigate("/");
        }
    }, []);

    // 방 만들기
    const onCreateRoomBtnClicked = async (e) => {
        e.preventDefault();
        // 방을 생성하여 정보를 받아오고
        const res = await axios.post(`/api/rooms`, {
            password: roomPassword,
        });
        const { roomNumber } = res.data;

        navigate(
            `${WAITING_ROOM_ROUTE_PATH}?room-number=${roomNumber}&room-password=${roomPassword}`
        );
    };

    return (
        <div className="wrapper">
            <h1>방 생성</h1>
            <form action="">
                <input
                    id="room-password"
                    className="input-box"
                    type="password"
                    placeholder="비밀번호를 입력해 주세요."
                    onChange={(e) => setRoomPassword(e.target.value)}
                ></input>
                <p id="password-info-message">
                    *비밀번호가 없으면 공개 방으로 생성됩니다
                </p>
                <button type="submit" onClick={onCreateRoomBtnClicked}>
                    <p>방 만들기 </p>
                </button>
            </form>
        </div>
    );
}

export const ROOM_CREATE_ROUTE_PATH = "/RoomCreate";
