import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import LoginForm from './LoginForm/loginForm';
import WaitingRoom from './WaitingRoom/WaitingRoom';
import Lobby from './Lobby/lobby'; 
import LobbyCreate from './Lobby/lobbyCreate';
import LobbyJoin from './Lobby/lobbyJoin';



function App() {
    return (
        <div id="app">
            <Router>
                <Routes>
                    <Route path="/" element={<LoginForm />} />
                    <Route path="/waitingRoom" element={<WaitingRoom />} />
                    <Route path="/lobby" element={<Lobby />} />
                    <Route path="/lobbyCreate" element={<LobbyCreate />} />
                    <Route path="/lobbyJoin" element={<LobbyJoin />} />
                    {/* 다른 경로와 컴포넌트들 추가 */}
                    {/* 우선 기본 경로 login으로 바꿔놧오욤 */}
                </Routes>
            </Router>
        </div>
    );
}

export default App;
