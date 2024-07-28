import React, { useState } from "react";
import { ImPencil2 } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import "./Loby.css";

const Lobby = () => {

    const navigate = useNavigate();

    const [nickname, setNickname] = useState("현재 내 닉네임");

    const updateNickname = (e) => {
        e.preventDefault();
        console.log(`닉네임이 ${nickname}로 변경되었습니다`);
    };

    const createRoom = (e) =>{
        e.preventDefault();
        navigate('/lobbyCreate');
        console.log("새로운 방 생성");
    }

    const encounterRoom = (e) =>{
        e.preventDefault();
        navigate('/lobbyJoin');
        console.log("기존 방에 참여");
    }

    // 현재는 대기실로 이동하게 해둠 
    const randomRoom = (e) =>{
        e.preventDefault();
        navigate('/waitingRoom');
        console.log("랜덤 방에 들어가기 ");
    }

    return (
        <div className="wrapper">
            <h1>
                Title Logo
            </h1>
            <form action="">
                <div className="input-box">
                    <input
                        type="text"
                        placeholder={nickname}
                        id="nickname"
                        onChange={(e) => setNickname(e.target.value)}
                        required
                    />
                    <ImPencil2
                        className="icon"
                        type="button"
                        onClick={updateNickname}
                    />
                </div>
            </form>
            <div className="navigateRoom">
                <button onClick={createRoom}> 방 생성 </button>
                <button onClick={encounterRoom}> 방 참여 </button>
                <button onClick={randomRoom}> 랜덤 매칭 </button>
            </div>
        </div>
    );
};

export default Lobby;
