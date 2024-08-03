import PropTypes from "prop-types";

export default function PlayerSlot({ player, isMe }) {
    if (!player) {
        return <div className="player-slot empty">빈 슬롯</div>;
    }

    return (
        <div
            className={`player-slot ${player.getIsReady() ? "ready" : ""} ${
                isMe ? "me" : ""
            }`}
        >
            <div className="player-icon">{player.icon}</div>
            <div className="player-nickname">{player.getPlayerNickname()}</div>
            <div className="player-ready-status">
                {player.getIsReady() ? "준비완료" : "대기중"}
            </div>
        </div>
    );
}

PlayerSlot.propTypes = {
    player: PropTypes.object,
    isMe: PropTypes.bool.isRequired,
};
