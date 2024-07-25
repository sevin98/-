import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import LoginForm from './LoginForm/loginForm';
import WaitingRoom from './WaitingRoom/WaitingRoom';

function App() {
    return (
        <div id="app">
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/waitingRoom" element={<WaitingRoom />} />
                    {/* 다른 경로와 컴포넌트들 추가 */}
                </Routes>
            </Router>
        </div>
    );
}

export default App;
