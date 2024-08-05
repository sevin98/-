import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GiFastForwardButton } from "react-icons/gi";

import { userRepository } from "../../repository";
import { ROOM_CREATE_ROUTE_PATH } from "./RoomCreate";
import { ROOM_JOIN_ROUTE_PATH } from "./RoomJoin";

import "./Lobby.css";
import { ImPencil2 } from "react-icons/im";

export default function Lobby() {
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
        // TODO : 랜덤하게 들어갈 수 있는 방의 구독 정보를 받아와서 WAITING_ROOM_ROUTE_PATH에 state로 넘겨주어야 함
        // navigate(WAITING_ROOM_ROUTE_PATH);
        console.error("랜덤 방에 들어가기 : 미구현");
    };

    return (
        <div id="container" className="rpgui-cursor-default">
            <div className="wrapper rpgui-content">
                <div>
                    <div className="rpgui-container framed main-frame">
                        <h1> Hi !! </h1>
                        <h2>{currentNickname} </h2>
                        <h1>Enjoy your game by</h1>
                    </div>
                    <div className="button-box-lobby">
                        <button onClick={onCreateRoomBtnClicked}>
                            click! 
                            <GiFastForwardButton />
                            <h2>새로운 방으로 시작하기</h2>
                        </button>
                    </div>
                    <hr className="grey"></hr>
                    <div className="button-box-lobby">
                        <button onClick={onExistRoomJoinBtnClicked}>
                            click!
                            <GiFastForwardButton />
                            <h2>초대 받은 방으로 이동</h2>
                        </button>
                    </div>
                    <hr className="grey"></hr>
                    <div className="button-box-lobby">
                        <button onClick={onRandomRoomJoinBtnClicked}>
                            click!
                            <GiFastForwardButton />
                            <h2>즉시 게임 시작하기!</h2>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const LOBBY_ROUTE_PATH = "/Lobby";
