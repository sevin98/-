import React from 'react';
import PropTypes from 'prop-types';

const ChatBox = ({ countdown, countdownMessage }) => {
    return (
        <div className="chat-box">
            {/* 카운트다운 표시 */}
            <div className="countdown-display">
                {countdown !== null ? countdown : ''}
            </div>
            {/* 카운트다운 종료 메시지 표시 */}
            {countdownMessage && (
                <div className="countdown-message">
                    {countdownMessage}
                </div>
            )}
        </div>
    );
};

ChatBox.propTypes = {
    countdown: PropTypes.number,
    countdownMessage: PropTypes.string,
};

export default ChatBox;
