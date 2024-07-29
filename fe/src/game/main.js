import Phaser, { Physics } from 'phaser'
import {MainMenu}  from './scenes/MainMenu'
import {Preloader} from './scenes/Preloader'
import {game} from './scenes/Game'
import GameUI from './scenes/GameUI'

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 250,
    parent: "game-container",
    backgroundColor: "#028af8",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // zoom:2,
    },
    scene: [Preloader, game, MainMenu, GameUI],
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
