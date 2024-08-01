import React from 'react';

function BackToLobbyButton({ isDisabled, onClick }) {
  return (
    <button 
      className={`back-to-lobby-button ${isDisabled ? 'disabled' : ''}`} 
      onClick={onClick}
      disabled={isDisabled}
    >
      돌아가기
    </button>
  );
}

export default BackToLobbyButton;
