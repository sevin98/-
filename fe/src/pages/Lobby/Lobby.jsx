import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { userRepository } from "../../repository";
import { ROOM_CREATE_ROUTE_PATH } from "./RoomCreate";
import { ROOM_JOIN_ROUTE_PATH } from "./RoomJoin";
import { WAITING_ROOM_ROUTE_PATH } from "../WaitingRoom/WaitingRoom";

import "./Lobby.css";
import { ImPencil2 } from "react-icons/im";

const Lobby = () => {
    const navigate = useNavigate();

    const [userProfile, setUserProfile] = useState(
        userRepository.getUserProfile()
    );
    // 현재 닉네임 상태 (TODO : 수정 가능)
    const [currentNickname, setNickname] = useState("");

    useEffect(() => {
        if (userProfile === null) {
            console.error("유저 정보가 없습니다.");
            navigate("/");
        } else {
            setNickname(userProfile.nickname);
        }
    }, [userProfile, navigate]);

    const onNicknameChangeBtnClicked = (e) => {
        e.preventDefault();
        // TODO : 닉네임 변경 기능 구현 (관련 API가 없어 현재 disabled 상태)
        // userRepository.setUserProfile({
        //     ...userProfile,
        //     nickname: currentNickname,
        // });
        // setUserProfile({ ...userProfile, nickname: currentNickname });
        // console.log(`닉네임이 ${currentNickname}로 변경되었습니다`);
    };

    const onCreateRoomBtnClicked = (e) => {
        e.preventDefault();
        navigate(ROOM_CREATE_ROUTE_PATH);
        console.log("새로운 방 생성");
    };

    const onExistRoomJoinBtnClicked = (e) => {
        e.preventDefault();
        navigate(ROOM_JOIN_ROUTE_PATH);
        console.log("기존 방에 참여");
    };

    // 현재는 대기실로 이동하게 해둠
    const onRandomRoomJoinBtnClicked = (e) => {
        e.preventDefault();
        navigate(WAITING_ROOM_ROUTE_PATH);
        console.log("랜덤 방에 들어가기 ");
    };

    return (
        <div className="wrapper">
            <h1>Title Logo</h1>
            <form action="">
                <div className="input-box">
                    <h6 id="player-nickname-label">이름:</h6>
                    <input
                        type="text"
                        value={currentNickname}
                        id="nickname"
                        onChange={(e) => setNickname(e.target.value)}
                        disabled
                    />
                    <ImPencil2
                        id="nickname-update-icon"
                        className="icon"
                        type="button"
                        onClick={onNicknameChangeBtnClicked}
                    />
                </div>
            </form>
            <div className="navigateRoom">
                <button onClick={onCreateRoomBtnClicked}>방 생성</button>
                <button onClick={onExistRoomJoinBtnClicked}>방 참여</button>
                <button onClick={onRandomRoomJoinBtnClicked}>랜덤 매칭</button>
            </div>
        </div>
    );
};

export const LOBBY_ROUTE_PATH = "/Lobby";

export default Lobby;
