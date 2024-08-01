import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { hasFalsy } from "../../util/validation";
import { userRepository } from "../../repository";
import axios from "../../network/AxiosClient";
import { getStompClient } from "../../network/StompClient";

import { LOGIN_FORM_ROUTE_PATH } from "../LoginForm/LoginForm";
import { PHASER_GAME_ROUTE_PATH } from "../../game/PhaserGame";
import { LOBBY_ROUTE_PATH } from "../Lobby/Lobby";

import PlayerGrid from "./PlayerGrid"; // 플레이어 슬롯 컴포넌트
import ReadyButton from "./ReadyButton"; // 레디 버튼 컴포넌트
import BackToLobbyButton from "./BackToLobbyButton"; // 뒤로가기 버튼 컴포넌트
import ShareRoomCodeButton from "./ShareRoomCodeButton"; // 방 코드 공유 버튼 컴포넌트
import ChatBox from "./ChatBox"; // 채팅창 컴포넌트

import { toast } from "react-toastify"; // react-toastify 추가
import "./WaitingRoom.css"; // CSS 파일

const WaitingRoom = () => {
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
    const [readyPlayers, setReadyPlayers] = useState([]);
    const [leftSecondsToStart, setLeftSecondsToStart] = useState(Infinity);
    const [countdownMessage, setCountdownMessage] = useState(""); // 카운트다운 완료 메시지 상태
    const [isPlayerReady, setIsPlayerReady] = useState(false); // 접속한 사용자의 레디 여부

    useEffect(() => {
        axios
            .post(`/api/rooms/${roomNumber}/join`, { password: roomPassword })
            .then(async (resp) => {
                // 방 진입, 방/플레이어 채널 구독 요청 먼저 수행하고
                const { roomSubscriptionInfo, playerSubscriptionInfo } =
                    resp.data;
                await subscribeChannels(
                    roomSubscriptionInfo,
                    playerSubscriptionInfo
                );

                // TODO : 기존에 방에 있던 플레이어들의 정보를 받아 joinedPlayers를 업데이트
                // // 현재 사용자 정보 추가
                // const currentUser = {
                //     ...userProfile,
                // };
                // setJoinedPlayers((prevPlayers) => {
                //     const existingUser = prevPlayers.find(
                //         (player) => player.uuid === currentUser.uuid
                //     );
                //     if (!existingUser) {
                //         return [...prevPlayers, currentUser];
                //     }
                //     return prevPlayers;
                // });
            });
    }, []);

    const subscribeChannels = async (
        roomSubscriptionInfo,
        playerSubscriptionInfo
    ) => {
        const stompClient = await getStompClient();
        // 방 채널 구독
        stompClient.subscribe(roomSubscriptionInfo, async (stompMessage) => {
            const message = JSON.parse(stompMessage.body);
            switch (message.type) {
                case "PLAYER_JOIN":
                    setJoinedPlayers((prev) => {
                        const updatedPlayers = message.data;
                        return [...prev, ...updatedPlayers];
                    });
                    break;
                case "PLAYER_READY":
                    setReadyPlayers((prev) => {
                        const updatedReadyPlayers = message.data;
                        return [...prev, ...updatedReadyPlayers];
                    });
                    break;
                case "SUBSCRIBE_GAME":
                    const { subscriptionInfo, startsAfterMilliSec } =
                        message.data;

                    // 게임 채널 구독
                    stompClient.subscribe(subscriptionInfo, (gameMessage) => {
                        const gameData = JSON.parse(gameMessage.body);
                        if (gameData.type === "ROUND_CHANGE") {
                            console.log(
                                `라운드 변경: ${gameData.data.nextRound}/${gameData.data.totalRound}`
                            );
                        } else if (gameData.type === "PHASE_CHANGE") {
                            console.log(
                                `페이즈 변경: ${gameData.data.phase}, ${gameData.data.finishAfterMilliSec}ms 후 종료`
                            );
                        }
                    });

                    // 카운트다운 시작
                    startCountdown(startsAfterMilliSec);
                    break;
                default:
                    break;
            }
        });

        // 플레이어 채널 구독
        (await getStompClient()).subscribe(
            playerSubscriptionInfo,
            (stompMessage) => {}
        );
    };

    const startCountdown = (startsAfterMilliSec) => {
        setCountdownMessage("게임이 곧 시작됩니다!");

        // 시작 시각을 계산해놓고
        const startsAt = Date.now() + startsAfterMilliSec;
        // 매우 짧은 주기로 남은 시간을 초 단위로 계산하여 줄여 나감
        setLeftSecondsToStart(Math.ceil(startsAfterMilliSec / 1000));
        const countdownTimer = setInterval(() => {
            // 남은 시간(초)이 바뀌었으면
            const curLeftSeconds = Math.ceil((startsAt - Date.now()) / 1000);
            if (leftSecondsToStart > curLeftSeconds) {
                // 반영해줌
                setLeftSecondsToStart(curLeftSeconds);

                // 시작 시간이 되었으면
                if (startsAt <= Date.now()) {
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
        <div className="waiting-room">
            {/* 왼쪽 위: 뒤로가기 버튼 */}
            <BackToLobbyButton
                onClick={onBackToLobbyBtnClicked}
                isDisabled={isPlayerReady}
            />

            {/* 오른쪽 위: 방 코드 공유 버튼 */}
            <ShareRoomCodeButton />

            {/* 플레이어 슬롯 (가운데) */}
            <PlayerGrid players={joinedPlayers} readyPlayers={readyPlayers} />

            {/* 왼쪽 아래: 레디 버튼 */}
            <ReadyButton onClick={onReadyBtnClicked} isReady={isPlayerReady} />

            {/* 오른쪽 아래: 채팅창 */}
            <ChatBox
                countdown={leftSecondsToStart}
                countdownMessage={countdownMessage}
            />
        </div>
    );
};

export const WAITING_ROOM_ROUTE_PATH = "/WaitingRoom";

export default WaitingRoom;
