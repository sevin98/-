import React from 'react';

function ReadyButton({ isReady, onClick }) {
  return (
    <button
      className={`ready-button ${isReady ? 'ready' : 'not-ready'}`}
      onClick={onClick}
      disabled={isReady} // 레디 상태일 때 버튼 비활성화
    >
      {isReady ? '준비 완료' : '준비하기'}
    </button>
  );
}

export default ReadyButton;
