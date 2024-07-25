import React from 'react';
import PlayerSlot from './PlayerSlot.jsx';

function PlayerGrid({ players }) {
  const slots = Array(8).fill(null);
  players.forEach((player, index) => {
    if (index < 8) slots[index] = player;
  });

  return (
    <div className="player-grid">
      {slots.map((player, index) => (
        <PlayerSlot key={index} player={player} isMe={index === 0} />
      ))}
    </div>
  );
}

export default PlayerGrid;