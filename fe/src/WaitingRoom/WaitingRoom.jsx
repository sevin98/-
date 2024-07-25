import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';
import PlayerGrid from './PlayerGrid.jsx';
import ReadyButton from './ReadyButton.jsx';
import BackToLobbyButton from './BackToLobbyButton.jsx';
import ShareRoomCodeButton from './ShareRoomCodeButton.jsx';
import ChatBox from './ChatBox.jsx';
import "./WaitingRoom.css";

function WaitingRoom() {
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [gameStatusMessage, setGameStatusMessage] = useState("게임 준비를 기다리고 있습니다.");
  const [isCountdownStarted, setIsCountdownStarted] = useState(false);
  const [isBackDisabled, setIsBackDisabled] = useState(false);

  const stompClient = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // STOMP 클라이언트 설정 및 연결
    stompClient.current = new Client({
      brokerURL: 'ws://your-websocket-server-url', // 실제 WebSocket 서버 URL로 변경해야 함
      onConnect: () => {
        console.log('Connected to STOMP');
        subscribeToRoom();
      },
    });

    stompClient.current.activate();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    setIsBackDisabled(isReady || isCountdownStarted);
  }, [isReady, isCountdownStarted]);

  const subscribeToRoom = () => {
    if (stompClient.current.connected) {
      // 방 정보 구독
      stompClient.current.subscribe(`/topic/room/${roomCode}`, (message) => {
        const data = JSON.parse(message.body);
        handleRoomUpdate(data);
      });

      // 게임 시작 신호 구독
      stompClient.current.subscribe(`/topic/room/${roomCode}/start`, () => {
        startCountdown();//신호 구독 성공시 메세지 세팅 및 카운트다운 시작
      });

      // 초기 방 정보 요청
      stompClient.current.publish({
        destination: `/app/room/${roomCode}/join`,
        body: JSON.stringify({ playerId: 'your-player-id' }) // 실제 플레이어 ID로 변경해야 함
      });
    }
  };

  const handleRoomUpdate = (data) => {
    setPlayers(data.players);
    setRoomCode(data.roomCode);
  };

  const handleCopySuccess = () => {
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000); // 클립보드 카피 성공 2초 후 카피완료 메시지 숨기기
  };

  const handleReady = () => {
    if (!isReady) {
      setIsReady(true);
      // 서버로 레디 상태 전송
      stompClient.current.publish({
        destination: `/app/room/${roomCode}/ready`,
        body: JSON.stringify({ playerId: 'your-player-id', isReady: true })
      });
    }
  };

  const startCountdown = () => {
    setIsCountdownStarted(true);
    setGameStatusMessage("곧 게임이 시작됩니다.");
    let count = 5;
    const countdownInterval = setInterval(() => {
      if (count > 0) {
        setGameStatusMessage(count.toString());
        count--;
      } else {
        setGameStatusMessage("시작!");
        clearInterval(countdownInterval);
        startGame();
      }
    }, 1000);
  };

  const startGame = () => {
    // 게임 화면으로 전환
    navigate('/game'); // '/game'은 게임 화면의 라우트 경로입니다. 실제 경로에 맞게 수정해야 함.
  };

  const handleBackToLobby = () => {
    if (!isBackDisabled) {
      // 서버에 방 나가기 요청
      stompClient.current.publish({
        destination: `/app/room/${roomCode}/leave`,
        body: JSON.stringify({ playerId: 'your-player-id' })
      });
      // 로비로 이동
      navigate('/lobby'); // '/lobby'는 로비 화면의 라우트 경로(임시). 실제 경로에 맞게 수정해야 함.
    }
  };

  return (
    <div className="waiting-room">
      <BackToLobbyButton isDisabled={isBackDisabled} onClick={handleBackToLobby} />
      <ShareRoomCodeButton roomCode={roomCode} onCopySuccess={handleCopySuccess} />
      <PlayerGrid players={players} />
      <ReadyButton isReady={isReady} onReady={handleReady} />
      <ChatBox 
        gameStatusMessage={gameStatusMessage} 
        copiedMessage={showCopiedMessage ? "대기실 코드가 클립보드에 복사되었습니다!" : null}
      />
    </div>
  );
}

export default WaitingRoom;