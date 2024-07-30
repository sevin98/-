import React, { useState, useEffect, useCallback } from 'react';
import { useStompClient } from '../../network/StompContext'; // STOMP 클라이언트 사용
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify'; // react-toastify 추가
import PlayerGrid from './PlayerGrid'; // 플레이어 슬롯 컴포넌트
import ReadyButton from './ReadyButton'; // 레디 버튼 컴포넌트
import BackToLobbyButton from './BackToLobbyButton'; // 뒤로가기 버튼 컴포넌트
import ShareRoomCodeButton from './ShareRoomCodeButton'; // 방 코드 공유 버튼 컴포넌트
import ChatBox from './ChatBox'; // 채팅창 컴포넌트
import "./WaitingRoom.css"; // CSS 파일

const WaitingRoom = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { roomSubscriptionInfo, playerSubscriptionInfo } = location.state || {};

    const [joinedPlayers, setJoinedPlayers] = useState([]);
    const [readyPlayers, setReadyPlayers] = useState([]);
    const [gameTopic, setGameTopic] = useState(null);
    const [countdown, setCountdown] = useState(null); // 카운트다운 상태 추가
    const [countdownMessage, setCountdownMessage] = useState(''); // 카운트다운 완료 메시지 상태

    const client = useStompClient();

    const handleSubscribe = useCallback(() => {
        if (!client || !roomSubscriptionInfo || !playerSubscriptionInfo) return;

        // 방 채널 구독
        client.subscribe(roomSubscriptionInfo.topic, (stompMessage) => {
            const message = JSON.parse(stompMessage.body);

            switch (message.type) {
                case 'PLAYER_JOIN':
                    setJoinedPlayers((prev) => {
                        const updatedPlayers = message.data;
                        return [...prev, ...updatedPlayers];
                    });
                    break;
                case 'PLAYER_READY':
                    setReadyPlayers((prev) => {
                        const updatedReadyPlayers = message.data;
                        return [...prev, ...updatedReadyPlayers];
                    });
                    break;
                case 'SUBSCRIBE_GAME':
                    const { subscriptionInfo, startsAfterMilliSec } = message.data;
                    setGameTopic(subscriptionInfo.topic);

                    // 게임 채널 구독
                    client.subscribe(subscriptionInfo.topic, (gameMessage) => {
                        const gameData = JSON.parse(gameMessage.body);
                        if (gameData.type === 'ROUND_CHANGE') {
                            console.log(`라운드 변경: ${gameData.data.nextRound}/${gameData.data.totalRound}`);
                        } else if (gameData.type === 'PHASE_CHANGE') {
                            console.log(`페이즈 변경: ${gameData.data.phase}, ${gameData.data.finishAfterMilliSec}ms 후 종료`);
                        }
                    }, {
                        subscriptionToken: subscriptionInfo.token,
                    });

                    // 게임 시작 지연 시간 처리
                    if (startsAfterMilliSec > 0) {
                        let countdownValue = Math.floor(startsAfterMilliSec / 1000); // 초 단위로 변환
                        setCountdown(countdownValue);
                        const countdownTimer = setInterval(() => {
                            setCountdown((prev) => {
                                const newCountdown = prev - 1;
                                if (newCountdown <= 0) {
                                    clearInterval(countdownTimer);
                                    setCountdownMessage('게임을 시작합니다!'); // 카운트다운 종료 후 메시지 설정
                                    setTimeout(() => {
                                        setCountdownMessage('');
                                        navigate('/GameStart');
                                    }, 0); // 메시지 표시 후 즉시 이동
                                }
                                return newCountdown;
                            });
                        }, 1000);

                    } else {
                        navigate('/GameStart');
                    }
                    break;
                default:
                    break;
            }
        }, {
            subscriptionToken: roomSubscriptionInfo.token,
        });

        // 플레이어 채널 구독
        client.subscribe(playerSubscriptionInfo.topic, (stompMessage) => {
            // 플레이어 채널 메시지 처리
        }, {
            subscriptionToken: playerSubscriptionInfo.token,
        });

    }, [client, roomSubscriptionInfo, playerSubscriptionInfo, navigate]);

    useEffect(() => {
        handleSubscribe();

        // 컴포넌트 언마운트 시 구독 해제
        return () => {
            client.deactivate();
        };
    }, [handleSubscribe, client]);

    const handleShareRoomCode = () => {
        const roomCode = sessionStorage.getItem('roomNumber');
        navigator.clipboard.writeText(roomCode).then(() => {
            toast.success('방 코드가 클립보드에 복사되었습니다.'); // 토스트 알림
        }).catch((err) => {
            toast.error('방 코드 복사 중 오류가 발생했습니다.'); // 오류 알림
        });
    };

    const handleReadyButtonClick = () => {
        client.publish({
            destination: `/ws/rooms/${sessionStorage.getItem('roomId')}/ready`, // 서버에서 사용할 목적지 경로
            body: JSON.stringify({}),
        });

        // 준비 상태 변경 메시지 토스트로 표시
        toast.success('준비 상태로 변경되었습니다.');
    };

    const handleBackToLobbyClick = () => {
        fetch(`/api/rooms/${sessionStorage.getItem('roomId')}/leave`, {
            method: 'POST',
        })
        .then(response => response.json())
        .then(() => {
            navigate('/lobby');
        })
        .catch(error => {
            toast.error('뒤로가기 처리 중 오류가 발생했습니다.');
        });
    };

    return (
        <div className="waiting-room">
            {/* 왼쪽 위: 뒤로가기 버튼 */}
            <BackToLobbyButton onClick={handleBackToLobbyClick} />
            
            {/* 플레이어 슬롯 (가운데) */}
            <PlayerGrid players={joinedPlayers} readyPlayers={readyPlayers} />

            {/* 왼쪽 아래: 레디 버튼 */}
            <ReadyButton onClick={handleReadyButtonClick} isReady={readyPlayers.some(player => player.id === sessionStorage.getItem('userId'))} />

            {/* 오른쪽 위: 방 코드 공유 버튼 */}
            <ShareRoomCodeButton roomCode={sessionStorage.getItem('roomNumber')} onCopySuccess={() => toast.success('방 코드가 클립보드에 복사되었습니다.')} />

            {/* 오른쪽 아래: 채팅창 */}
            <ChatBox countdown={countdown} countdownMessage={countdownMessage} />
        </div>
    );
};

export default WaitingRoom;
