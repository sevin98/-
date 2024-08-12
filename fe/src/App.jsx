import React, { useState, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "../src/router/router";
import axios from "../src/network/AxiosClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Popup from "./components/Popup";
import { LOBBY_ROUTE_PATH } from "../src/pages/Lobby/Lobby";
import { ROOM_JOIN_ROUTE_PATH } from "./pages/Lobby/RoomJoin";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";

function App() {
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [roomNumber, setRoomNumber] = useState(null);

    useEffect(() => {
        const handlePhaseGameEnd = (event) => {
            const roomNumber = event.detail.roomNumber;
            setRoomNumber(roomNumber);
            setPopupVisible(true);
        };

        window.addEventListener("GAME_END", handlePhaseGameEnd);

        return () => {
            window.removeEventListener("GAME_END", handlePhaseGameEnd);
        };
    }, []);

    const handleReturnToWaitingRoom = async (e) => {
        navigate(ROOM_JOIN_ROUTE_PATH);
        setPopupVisible(false);
    };

    const handleReturnToLobby = async () => {
        try {
            const res = await axios.post(`/api/rooms/${roomNumber}/leave`);

            if (res.status === 204) {
                navigate(LOBBY_ROUTE_PATH);
            }
        } catch (error) {
            console.log(error);
        }
        setPopupVisible(false);
    };

    return (
        <div id="app">
            <RouterProvider router={router} />
            <ToastContainer />
            <MusicPlayer />
            <Popup
                visible={isPopupVisible}
                onExit={handleReturnToWaitingRoom}
                onReturnToLobby={handleReturnToLobby}
            />
        </div>
    );
}

export default App;

