import { toast } from "react-toastify";

export default function ShareRoomCodeButton() {
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
            className="share-room-code-button"
            onClick={onShareRoomCodeBtnClicked}
        >
            참가 링크 복사
        </button>
    );
}
