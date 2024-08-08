import Phaser, { Physics } from 'phaser'
import {MainMenu}  from './scenes/MainMenu'
import {Preloader} from './scenes/Preloader'
import {game} from './scenes/Game'
import GameUI from './scenes/GameUI'
import { useEffect } from 'react'

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 250,
    parent: "game-container",
    backgroundColor: "#028af8",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // zoom:1,
    },
    scene: [Preloader, MainMenu, game, GameUI,],

    physics: {
        default: "arcade",
        arcade: {
            debug: true,
        },
    },
};

const StartGame = (parent) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
