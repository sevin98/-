import React from 'react';

function ReadyButton({ isReady, onReady }) {
  return (
    <button 
      className={`ready-button ${isReady ? 'ready' : ''}`} 
      onClick={onReady}
      disabled={isReady}
    >
      {isReady ? '준비 완료' : '준비하기'}
    </button>
  );
}

export default ReadyButton;
