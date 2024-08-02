import PropTypes from "prop-types";

export default function ReadyButton({ isReady, onClick }) {
    return (
        <button
            className={`ready-button ${isReady ? "ready" : "not-ready"}`}
            onClick={onClick}
            disabled={isReady} // 레디 상태일 때 버튼 비활성화
        >
            {isReady ? "준비 완료" : "준비하기"}
        </button>
    );
}

ReadyButton.propTypes = {
    isReady: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};
