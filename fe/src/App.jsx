import { useRef, useState } from 'react';

import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import LoginForm from './LoginForm/loginForm';

function App ()
{
   
    return (
        <div id="app">
            <LoginForm />
        </div>
    )
}

export default App
