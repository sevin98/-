import React from 'react';

function ChatBox({ gameStatusMessage, copiedMessage }) {
  return (
    <div className="chat-box">
      <div className="game-status">{gameStatusMessage}</div>
      {copiedMessage && <div className="copied-message">{copiedMessage}</div>}
    </div>
  );
}

export default ChatBox;