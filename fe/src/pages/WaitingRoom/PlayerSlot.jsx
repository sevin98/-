import PropTypes from "prop-types";

export default function PlayerSlot({ player, isMe }) {
    if (!player) {
        return <div className="player-slot empty">빈 슬롯</div>;
    }

    return (
        <div
            className={`player-slot ${player.isReady ? "ready" : ""} ${
                isMe ? "me" : ""
            }`}
        >
            <div className="player-icon">{player.icon}</div>
            <div className="player-nickname">{player.nickname}</div>
            <div className="player-ready-status">
                {player.isReady ? "준비완료" : "대기중"}
            </div>
        </div>
    );
}

PlayerSlot.propTypes = {
    // TODO: 누락된 player props 정의
    isMe: PropTypes.bool.isRequired,
};
