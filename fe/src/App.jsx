import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StompProvider } from './network/StompContext';
import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import LoginForm from './LoginForm/loginForm';
import WaitingRoom from './WaitingRoom/WaitingRoom';
import Lobby from './Lobby/Lobby'; 
import LobbyCreate from './Lobby/LobbyCreate';
import LobbyJoin from './Lobby/LobbyJoin';

function App() {
    return (
        <div id="app">
            <StompProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<LoginForm />} />
                        <Route path="/waitingRoom" element={<WaitingRoom />} />
                        <Route path="/lobby" element={<Lobby />} />
                        <Route path="/lobbyCreate" element={<LobbyCreate />} />
                        <Route path="/lobbyJoin" element={<LobbyJoin />} />
                        {/* 다른 경로와 컴포넌트들 추가 */}
                    </Routes>
                </Router>
            </StompProvider>
        </div>
    );
}
export default App;
