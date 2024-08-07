import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

// BackToLobbyButton 컴포넌트
function BackToLobbyButton({ isDisabled, onClick }) {
    return (
        <button
            className={`rpgui-button ${isDisabled ? "disabled" : ""}`}
            onClick={onClick}
            disabled={isDisabled}
        >
            <h2>돌아가기</h2>
        </button>
    );
}

BackToLobbyButton.propTypes = {
    isDisabled: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

// ChatBox 컴포넌트
function ChatBox({ leftSecondsToStart, countdownMessage }) {
    const leftSoundsToStartDisplayingText =
        leftSecondsToStart === Infinity || leftSecondsToStart === null
            ? ""
            : leftSecondsToStart;
    return (
        <div className="rpgui-container framed-grey chat-box">
            <div className="countdown-display">
                {leftSoundsToStartDisplayingText}
            </div>
            {countdownMessage && (
                <div className="countdown-message">{countdownMessage}</div>
            )}
        </div>
    );
}

ChatBox.propTypes = {
    leftSecondsToStart: PropTypes.number,
    countdownMessage: PropTypes.string,
};

// PlayerSlot 컴포넌트
function PlayerSlot({ player, isMe }) {
    if (!player) {
        return <div className="rpgui-container framed-grey player-slot empty"><h2 className="empty-slot">빈 슬롯</h2></div>;
    }

    return (
        <div
            className={`rpgui-container framed-grey player-slot ${player.getIsReady() ? "ready" : ""} ${
                isMe ? "me" : ""
            }`}
        >
            <div className="player-icon">{player.icon}</div>
            <h2 className="player-nickname">{player.getPlayerNickname()}</h2>
            <h2 className={`player-ready-status ${player.getIsReady() ? "ready" : "not-ready"}`}>
                {player.getIsReady() ? "준비완료" : "대기중"}
            </h2>
        </div>
    );
}

PlayerSlot.propTypes = {
    player: PropTypes.object,
    isMe: PropTypes.bool.isRequired,
};

// PlayerGrid 컴포넌트
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

PlayerGrid.propTypes = {
    players: PropTypes.array.isRequired,
};

// ReadyButton 컴포넌트
function ReadyButton({ isReady, onClick }) {
    return ( 
        <button
            className={`rpgui-button ${isReady ? "ready" : "not-ready"}`}
            onClick={onClick}
            disabled={isReady}
        >
            {isReady ? <h2>준비 완료</h2> : <h2>준비하기</h2> }
        </button>
    );
}

ReadyButton.propTypes = {
    isReady: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

// ShareRoomCodeButton 컴포넌트
function ShareRoomCodeButton() {
    const onShareRoomCodeBtnClicked = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("게임 참가 링크가 복사되었습니다.");
        } catch (err) {
            console.error("클립보드 복사 에러:", err);
        }
    };

    return (
        <button
            className="rpgui-button"
            onClick={onShareRoomCodeBtnClicked}
        >
            <h2>참가 링크 복사</h2>
        </button>
    );
}

// 모든 컴포넌트를 내보냄
export {
    BackToLobbyButton,
    ChatBox,
    PlayerGrid,
    ReadyButton,
    ShareRoomCodeButton
};