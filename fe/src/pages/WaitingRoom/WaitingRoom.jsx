import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify"; // react-toastify 추가
import axios from "../../network/AxiosClient"; // 기본 설정된 axios 가져오기
import PlayerGrid from "./PlayerGrid"; // 플레이어 슬롯 컴포넌트
import ReadyButton from "./ReadyButton"; // 레디 버튼 컴포넌트
import BackToLobbyButton from "./BackToLobbyButton"; // 뒤로가기 버튼 컴포넌트
import ShareRoomCodeButton from "./ShareRoomCodeButton"; // 방 코드 공유 버튼 컴포넌트
import ChatBox from "./ChatBox"; // 채팅창 컴포넌트
import "./WaitingRoom.css"; // CSS 파일
import { getStompClient } from "../../network/StompClient";
import { userRepository } from "../../repository";
import { hasFalsy } from "../../util/validation";

const WaitingRoom = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        // 방 및 플레이어 채널 구독에 필요한 정보
        roomSubscriptionInfo,
        playerSubscriptionInfo,
        // 대기 중인 방 번호
        roomNumber,
    } = location.state;
    const userProfile = userRepository.getUserProfile();
    if (
        hasFalsy(
            roomSubscriptionInfo,
            playerSubscriptionInfo,
            roomNumber,
            userProfile
        )
    ) {
        console.log(
            roomSubscriptionInfo,
            playerSubscriptionInfo,
            roomNumber,
            userProfile
        );
        console.error("필수 정보가 없습니다.");
        navigate("/");
    }

    const [joinedPlayers, setJoinedPlayers] = useState([]);
    const [readyPlayers, setReadyPlayers] = useState([]);
    const [countdown, setCountdown] = useState(null); // 카운트다운 상태 추가
    const [countdownMessage, setCountdownMessage] = useState(""); // 카운트다운 완료 메시지 상태
    const [isReady, setIsReady] = useState(false); // 접속한 사용자의 레디 여부

    const handleSubscribe = useCallback(async () => {
        // 방 채널 구독
        (await getStompClient()).subscribe(
            roomSubscriptionInfo,
            async (stompMessage) => {
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
                        (await getStompClient()).subscribe(
                            subscriptionInfo,
                            (gameMessage) => {
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
                            }
                        );

                        // 게임 시작 지연 시간 처리
                        if (startsAfterMilliSec > 0) {
                            let countdownValue = Math.floor(
                                startsAfterMilliSec / 1000
                            ); // 초 단위로 변환
                            setCountdown(countdownValue);
                            const countdownTimer = setInterval(() => {
                                setCountdown((prev) => {
                                    const newCountdown = prev - 1;
                                    if (newCountdown <= 0) {
                                        clearInterval(countdownTimer);
                                        setCountdownMessage(
                                            "게임을 시작합니다!"
                                        ); // 카운트다운 종료 후 메시지 설정
                                        setTimeout(() => {
                                            setCountdownMessage("");
                                            navigate("/GameStart");
                                        }, 0); // 메시지 표시 후 즉시 이동
                                    }
                                    return newCountdown;
                                });
                            }, 1000);
                        } else {
                            navigate("/GameStart");
                        }
                        break;
                    default:
                        break;
                }
            }
        );

        // 플레이어 채널 구독
        (await getStompClient()).subscribe(
            playerSubscriptionInfo,
            (stompMessage) => {
                // 플레이어 채널 메시지 처리
            }
        );
    }, [roomSubscriptionInfo, playerSubscriptionInfo, navigate]);

    useEffect(() => {
        // 현재 사용자 정보 추가
        const currentUser = {
            ...userProfile,
        };
        setJoinedPlayers((prevPlayers) => {
            const existingUser = prevPlayers.find(
                (player) => player.uuid === currentUser.uuid
            );
            if (!existingUser) {
                return [...prevPlayers, currentUser];
            }
            return prevPlayers;
        });

        handleSubscribe();
    }, []);

    const handleReadyButtonClick = async () => {
        console.log(isReady);
        if (isReady) return; // 이미 준비 상태면 아무 작업도 하지 않음

        const roomId = (await getStompClient()).publish({
            destination: `/ws/rooms/${roomId}/ready`,
            body: JSON.stringify({}),
            headers: { "content-type": "application/json" },
        });
        setIsReady(true);
        toast.success("준비 상태로 변경되었습니다.");
    };

    const handleBackToLobbyClick = async () => {
        const roomId = roomNumber;
        // 방 나가기 요청 (요청 성공 여부와 관계없이 로비로 이동)
        axios.post(`/api/rooms/${roomId}/leave`).finally(() => {
            navigate("/Lobby");
        });
    };

    return (
        <div className="waiting-room">
            {/* 왼쪽 위: 뒤로가기 버튼 */}
            <BackToLobbyButton
                onClick={handleBackToLobbyClick}
                isDisabled={isReady || countdown > 0}
            />

            {/* 오른쪽 위: 방 코드 공유 버튼 */}
            <ShareRoomCodeButton
                roomCode={roomNumber}
                onCopySuccess={() =>
                    toast.success("방 코드가 클립보드에 복사되었습니다.")
                }
            />
            {/* 플레이어 슬롯 (가운데) */}
            <PlayerGrid players={joinedPlayers} readyPlayers={readyPlayers} />

            {/* 왼쪽 아래: 레디 버튼 */}
            <ReadyButton onClick={handleReadyButtonClick} isReady={isReady} />

            {/* 오른쪽 아래: 채팅창 */}
            <ChatBox
                countdown={countdown}
                countdownMessage={countdownMessage}
            />
        </div>
    );
};

export const ROUTE_PATH = "/WaitingRoom";

export default WaitingRoom;
