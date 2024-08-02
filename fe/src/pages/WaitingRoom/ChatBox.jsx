import PropTypes from "prop-types";
import { useState } from "react";

export default function ChatBox({ leftSecondsToStart, countdownMessage }) {
    const leftSoundsToStartDisplayingText =
        leftSecondsToStart === Infinity || leftSecondsToStart === null
            ? ""
            : leftSecondsToStart;
    return (
        <div className="chat-box">
            {/* 카운트다운 표시 */}
            <div className="countdown-display">
                {leftSoundsToStartDisplayingText}
            </div>
            {/* 카운트다운 종료 메시지 표시 */}
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
