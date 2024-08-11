import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { hasFalsy } from "../../util/validation";
import { getRoomRepository, userRepository } from "../../repository";
import axios, { updateAxiosAccessToken } from "../../network/AxiosClient";
import { getStompClient } from "../../network/StompClient";

import { LOGIN_FORM_ROUTE_PATH } from "../LoginForm/LoginForm";
import { PHASER_GAME_ROUTE_PATH } from "../../game/PhaserGame";
import { LOBBY_ROUTE_PATH } from "../Lobby/Lobby";

import {
    BackToLobbyButton,
    ChatBox,
    PlayerGrid,
    ReadyButton,
    ShareRoomCodeButton,
} from "./WaitingRoomComponents"; //컴포넌트 import

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

    const [userProfile, setUserProfile] = useState(null);
    const [joinedPlayers, setJoinedPlayers] = useState([]);
    const [isPlayerReady, setIsPlayerReady] = useState(false); // 접속한 사용자의 레디 여부

    const [leftSecondsToStart, setLeftSecondsToStart] = useState(Infinity);
    const [countdownMessage, setCountdownMessage] = useState(""); // 카운트다운 완료 메시지 상태
    const [roomRepository, setRoomRepository] = useState(null);
    let [isCountdownStarted, setIsCountdownStarted] = useState(false);

    useEffect(() => {
        setUserProfile(userRepository.getUserProfile());
        setRoomRepository(getRoomRepository(roomNumber, roomPassword));
    }, [roomNumber, roomPassword]);

    useEffect(() => {
        // roomRepository가 정상적으로 초기화 되었을 때만 실행
        if (!roomRepository) {
            return;
        }

        // UserProfile의 초기화에 성공하면
        ensureAndGetUserProfile().then(async () => {
            axios
                .post(`/api/rooms/${roomNumber}/join`, {
                    password: roomPassword,
                })
                .then((resp) => {
                    const { roomSubscriptionInfo, playerSubscriptionInfo } =
                        resp.data;

                    // 방 진입, 방/플레이어 채널 구독 요청
                    roomRepository.startSubscribeRoom(roomSubscriptionInfo);
                    roomRepository.startSubscribePlayer(playerSubscriptionInfo);

                    // 주기적으로 플레이어 목록과 게임 시작 시각을 업데이트
                    const updateDataIntervalId = setInterval(() => {
                        setJoinedPlayers(roomRepository.getJoinedPlayers());

                        // 게임 시작 시간이 정해졌고, 아직 카운트다운을 시작하지 않았다면
                        if (
                            roomRepository.getGameStartsAt() &&
                            !isCountdownStarted
                        ) {
                            // 카운트다운 시작
                            setIsCountdownStarted(true);
                            startCountdown(roomRepository.getGameStartsAt());
                        } else if (isCountdownStarted) {
                            clearInterval(updateDataIntervalId);
                        }
                    }, 10);
                })
                .catch((error) => {
                    roomRepository.clear();
                    navigate(LOGIN_FORM_ROUTE_PATH);
                });
        });

        return () => {
            roomRepository.clear();
        };
    }, [roomRepository]);

    const ensureAndGetUserProfile = async () => {
        if (userProfile) {
            return userProfile;
        } else {
            try {
                const resp = await axios.post("/api/auth/guest/sign-up");
                const { accessToken, userProfile, webSocketConnectionToken } =
                    resp.data;

                // 인증 및 사용자 정보 초기화
                updateAxiosAccessToken(accessToken);
                userRepository.setUserProfile(userProfile);
                setUserProfile(userProfile); // 상태 업데이트

                // STOMP Client 초기화
                getStompClient(webSocketConnectionToken);

                return userProfile;
            } catch (error) {
                toast.error("게스트 로그인 실패");
                navigate(LOGIN_FORM_ROUTE_PATH);
                throw new Error("게스트 로그인 실패");
            }
        }
    };

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
            <div className="wrapper rpgui-content">
                <div className="rpgui-container framed">
                    <BackToLobbyButton
                        onClick={onBackToLobbyBtnClicked}
                        isDisabled={isPlayerReady}
                    />
                    <ShareRoomCodeButton />
                    <PlayerGrid players={joinedPlayers} />
                    <ReadyButton
                        onClick={onReadyBtnClicked}
                        isReady={isPlayerReady}
                    />
                    <ChatBox
                        leftSecondsToStart={leftSecondsToStart}
                        countdownMessage={countdownMessage}
                    />
                </div>
            </div>
        </div>
    );
}

export const WAITING_ROOM_ROUTE_PATH = "/WaitingRoom";
