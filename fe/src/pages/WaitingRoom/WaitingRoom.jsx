import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { hasFalsy } from "../../util/validation";
import { getRoomRepository, userRepository } from "../../repository";
import axios from "../../network/AxiosClient";
import { getStompClient } from "../../network/StompClient";

import { LOGIN_FORM_ROUTE_PATH } from "../LoginForm/LoginForm";
import { PHASER_GAME_ROUTE_PATH } from "../../game/PhaserGame";
import { LOBBY_ROUTE_PATH } from "../Lobby/Lobby";

import { BackToLobbyButton, ChatBox, PlayerGrid, ReadyButton, ShareRoomCodeButton } from './WaitingRoomComponents'; //컴포넌트 import

import { toast } from "react-toastify"; // react-toastify 추가
import "./WaitingRoom.css"; // CSS 파일

export default function WaitingRoom() {
    const navigate = useNavigate();

    // 방에 참여하기 위한 방 번호와 비밀번호 정보 가져오기
    const [searchParams, setSearchParams] = useSearchParams();
    const roomNumber = searchParams.get("room-number");
    const roomPassword = searchParams.get("room-password");

    if (hasFalsy(roomNumber)) {
        console.error("필수 정보가 없습니다.");
        navigate(LOGIN_FORM_ROUTE_PATH);
    }

    const [userProfile, setUserProfile] = useState(
        userRepository.getUserProfile()
    );
    if (!userProfile) {
        // TODO : 로그인 되어 있지 않은 상태이면 게스트 로그인으로 참가시켜주기
        console.error("유저 정보가 없습니다.");
        navigate(LOGIN_FORM_ROUTE_PATH);
    }

    const [joinedPlayers, setJoinedPlayers] = useState([]);
    const [isPlayerReady, setIsPlayerReady] = useState(false); // 접속한 사용자의 레디 여부

    const [leftSecondsToStart, setLeftSecondsToStart] = useState(Infinity);
    const [countdownMessage, setCountdownMessage] = useState(""); // 카운트다운 완료 메시지 상태
    const [gameStartsAt, setGameStartsAt] = useState(null); // 게임 시작 시각
    let isCountdownStarted = false;

    const roomRepository = getRoomRepository(roomNumber, roomPassword);

    useEffect(() => {
        axios
            .post(`/api/rooms/${roomNumber}/join`, { password: roomPassword })
            .then(async (resp) => {
                // 방 진입, 방/플레이어 채널 구독 요청
                const { roomSubscriptionInfo, playerSubscriptionInfo } =
                    resp.data;
                roomRepository.startSubscribeRoom(roomSubscriptionInfo);
                roomRepository.startSubscribePlayer(playerSubscriptionInfo);
            })
            .catch((error) => {
                if (error.response.status === 404) {
                    toast.error("해당하는 방이 없습니다.");
                } else if (error.response.status === 401) {
                    toast.error("비밀번호가 틀립니다.");
                } else if (error.response.status === 409) {
                    toast.error("이미 8명이 참가한 방입니다.");
                } else {
                    toast.error("방 참가 중 오류가 발생했습니다.");
                }
            });

        // 페이지를 떠날 때 방 나가기 처리
        const handleBeforeUnload = (event) => {
            // axios.post(`/api/rooms/${roomNumber}/leave`).catch((err) => {
            //     console.error("Failed to leave room:", err);
            // });
        };

        // 브라우저를 닫을 때 leave API 호출
        window.addEventListener("beforeunload", handleBeforeUnload);
        // 컴포넌트가 언마운트될 때 클린업 함수 실행
        return () => {
            clearInterval(updateDataIntervalId);
            roomRepository.endSubscribe();
            window.removeEventListener("beforeunload", handleBeforeUnload);

            // 방 나가기 요청
            // axios.post(`/api/rooms/${roomNumber}/leave`).catch((err) => {
            //     console.error("Failed to leave room:", err);
            // });
        };
    }, []);

    // 방 정보 업데이트 주기 설정
    const updateDataIntervalId = setInterval(() => {
        setJoinedPlayers(roomRepository.getJoinedPlayers());
        setGameStartsAt(roomRepository.getGameStartsAt());

        // 게임 시작 시간이 정해졌고, 아직 카운트다운을 시작하지 않았다면
        if (gameStartsAt && !isCountdownStarted) {
            // 카운트다운 시작
            isCountdownStarted = true;
            startCountdown(gameStartsAt);
        }
    }, 10);

    const startCountdown = (gameStartsAt) => {
        setCountdownMessage("게임이 곧 시작됩니다!");

        // 매우 짧은 주기로 남은 시간을 초 단위로 계산하여 줄여 나감
        const leftSecondsToStart = Math.ceil(
            (gameStartsAt - Date.now()) / 1000
        );
        setLeftSecondsToStart(leftSecondsToStart);

        const countdownTimer = setInterval(() => {
            // 남은 시간(초)이 바뀌었으면
            const curLeftSeconds = Math.ceil(
                (gameStartsAt - Date.now()) / 1000
            );
            if (leftSecondsToStart > curLeftSeconds) {
                // 반영해주고
                setLeftSecondsToStart(curLeftSeconds);

                // 시작 시간이 되었으면
                if (gameStartsAt <= Date.now()) {
                    // 카운트다운 종료하고 게임 시작
                    clearInterval(countdownTimer);
                    setCountdownMessage("");
                    navigate(PHASER_GAME_ROUTE_PATH, {
                        state: { roomNumber },
                    });
                }
            }
        }, 10);
    };

    const onReadyBtnClicked = async () => {
        // 이미 준비 상태면 아무 작업도 하지 않음
        if (isPlayerReady) return;
        // 아니라면 게임 서버에 준비 상태 변경을 요청하고 화면에 반영
        (await getStompClient()).publish({
            destination: `/ws/rooms/${roomNumber}/ready`,
        });
        setIsPlayerReady(true);
        toast.success("준비 상태로 변경되었습니다.");
    };

    const onBackToLobbyBtnClicked = async () => {
        // 방 나가기 요청 (요청 성공 여부와 관계없이 로비로 이동)
        axios.post(`/api/rooms/${roomNumber}/leave`).finally(() => {
            navigate(LOBBY_ROUTE_PATH);
        });
    };

    return (
        <div id="container" className="rpgui-cursor-default">
            <div className="waiting-room">
                {/* 왼쪽 위: 뒤로가기 버튼 */}
                <BackToLobbyButton
                    onClick={onBackToLobbyBtnClicked}
                    isDisabled={isPlayerReady}
                />

                {/* 오른쪽 위: 방 코드 공유 버튼 */}
                <ShareRoomCodeButton />

                {/* 플레이어 슬롯 (가운데) */}
                <PlayerGrid players={joinedPlayers} />

                {/* 왼쪽 아래: 레디 버튼 */}
                <ReadyButton
                    onClick={onReadyBtnClicked}
                    isReady={isPlayerReady}
                />

                {/* 오른쪽 아래: 채팅창 */}
                <ChatBox
                    leftSecondsToStart={leftSecondsToStart}
                    countdownMessage={countdownMessage}
                />
            </div>
        </div>
    );
}

export const WAITING_ROOM_ROUTE_PATH = "/WaitingRoom";
