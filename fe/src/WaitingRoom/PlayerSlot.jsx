import React from 'react';

function PlayerSlot({ player }) {
  if (!player) {
    return <div className="player-slot empty">빈 슬롯</div>;
  }

  return (
    <div className={`player-slot ${player.isReady ? 'ready' : ''}`}>
      <div className="player-icon">{player.icon}</div>
      <div className="player-nickname">{player.nickname}</div>
      <div className="player-ready-status">
        {player.isReady ? '준비완료' : '대기중'}
      </div>
    </div>
  );
}

export default PlayerSlot;