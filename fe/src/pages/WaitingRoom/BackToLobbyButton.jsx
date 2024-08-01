import PropTypes from "prop-types";

export default function BackToLobbyButton({ isDisabled, onClick }) {
    return (
        <button
            className={`back-to-lobby-button ${isDisabled ? "disabled" : ""}`}
            onClick={onClick}
            disabled={isDisabled}
        >
            돌아가기
        </button>
    );
}

BackToLobbyButton.propTypes = {
    isDisabled: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};
