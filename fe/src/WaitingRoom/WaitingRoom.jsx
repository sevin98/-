import React, { useState, useEffect, useCallback } from 'react';
import { useStompClient } from '../network/StompContext';
import { useNavigate } from 'react-router-dom';
import PlayerGrid from './PlayerGrid';
import ReadyButton from './ReadyButton';
import BackToLobbyButton from './BackToLobbyButton';
import ShareRoomCodeButton from './ShareRoomCodeButton';
import ChatBox from './ChatBox';
import "./WaitingRoom.css";

function WaitingRoom() {
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [gameStatusMessage, setGameStatusMessage] = useState("게임 준비를 기다리고 있습니다.");
  const [isCountdownStarted, setIsCountdownStarted] = useState(false);
  const [isBackDisabled, setIsBackDisabled] = useState(false);
  const [playerId, setPlayerId] = useState('');

  const stompClient = useStompClient();
  const navigate = useNavigate();

  const startCountdown = useCallback(() => {
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
  }, []);

  const subscribeToRoom = useCallback(() => {
    if (stompClient && stompClient.connected && roomCode) {
      const roomSubscription = stompClient.subscribe(`/topic/room/${roomCode}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          handleRoomUpdate(data);
        } catch (error) {
          console.error('Failed to parse room update:', error);
        }
      });

      const startSubscription = stompClient.subscribe(`/topic/room/${roomCode}/start`, () => {
        startCountdown();
      });

      stompClient.publish({
        destination: `/app/room/${roomCode}/join`,
        body: JSON.stringify({ playerId })
      });

      return () => {
        roomSubscription.unsubscribe();
        startSubscription.unsubscribe();
      };
    }
  }, [stompClient, roomCode, playerId, startCountdown]);

  useEffect(() => {
    if (!stompClient) {
      console.log("STOMP client is not available yet");
      return;
    }

    console.log("STOMP Client:", stompClient);

    const fetchPlayerId = async () => {
      try {
        // const response = await fetch('/api/player/id');
        // const data = await response.json();
        // setPlayerId(data.playerId);
        
        // 임시 해결책: 랜덤 ID 생성
        setPlayerId(`player_${Math.random().toString(36).substr(2, 9)}`);
      } catch (error) {
        console.error('Failed to fetch player ID:', error);
      }
    };

    fetchPlayerId();
  }, [stompClient]);

  useEffect(() => {
    if (stompClient && roomCode) {
      const unsubscribe = subscribeToRoom();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [stompClient, roomCode, subscribeToRoom]);

  useEffect(() => {
    setIsBackDisabled(isReady || isCountdownStarted);
  }, [isReady, isCountdownStarted]);

  const handleRoomUpdate = (data) => {
    setPlayers(data.players);
    setRoomCode(data.roomCode);
  };

  const handleCopySuccess = () => {
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  const handleReady = () => {
    if (!isReady && stompClient && stompClient.connected) {
      setIsReady(true);
      stompClient.publish({
        destination: `/app/room/${roomCode}/ready`,
        body: JSON.stringify({ playerId, isReady: true })
      });
    }
  };

  const startGame = () => {
    navigate('/game');
  };

  const handleBackToLobby = () => {
    if (!isBackDisabled && stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/app/room/${roomCode}/leave`,
        body: JSON.stringify({ playerId })
      });
      navigate('/lobby');
    }
  };

  if (!stompClient || !stompClient.connected) {
    return <div>게임 서버에 연결 중...</div>;
  }

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
