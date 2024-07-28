import React from 'react';

function ShareRoomCodeButton({ roomCode, onCopySuccess }) {
  const handleShareRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      onCopySuccess();
    } catch (err) {
      console.error('클립보드 복사 에러:', err);
      // 복사 실패 처리 로직 추가
    }
  };

  return (
    <button className="share-room-code-button" onClick={handleShareRoomCode}>
      방 코드 복사
    </button>
  );
}

export default ShareRoomCodeButton;
