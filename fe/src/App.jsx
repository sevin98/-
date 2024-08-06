import React, { useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "../src/router/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Popup from "./components/Popup"; // Popup 컴포넌트 import
// import { LOBBY_ROUTE_PATH } from "../Lobby/Lobby";

function App() {
    const [isPopupVisible, setPopupVisible] = useState(false);

    useEffect(() => {
        const handlePhaseFinished = () => {
            setPopupVisible(true);
        };

        window.addEventListener("phaseFinished", handlePhaseFinished);

        return () => {
            window.removeEventListener("phaseFinished", handlePhaseFinished);
        };
    }, []);

    const handleExit = async (e) => {
        try {
            const res = await axios.post(`/api/rooms/${roomNumber}/leave`, {
                password: roomPassword,
            });

            if (res.status === 200) {
                // navigate(LOBBY_ROUTE_PATH);
            }
        } catch (error) {
            console.log(error);
        }
        setPopupVisible(false);
    };

    const handleReturnToLobby = () => {
        // 방으로 돌아가기 로직 구현
        console.log("Return to Lobby");
        // 필요한 추가 방으로 돌아가기 로직
        setPopupVisible(false);
    };

    return (
        <div id="app">
            <RouterProvider router={router} />
            <ToastContainer />
            <Popup
                visible={isPopupVisible}
                onExit={handleExit}
                onReturnToLobby={handleReturnToLobby}
            />
        </div>
    );
}

export default App;
