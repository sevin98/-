import Phaser, { Physics } from 'phaser'
import {MainMenu}  from './scenes/MainMenu'
import {Preloader} from './scenes/Preloader'
import {game} from './scenes/game'

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 250,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Preloader,
        game,
        MainMenu,
        
    ],
    scale:{
        zoom: 2 // 카메라 스케일 바꾸기
    },
    physics:{
        default: "arcade",
        arcade:{
            debug: true
        }
    }
};

export default new Phaser.Game(config);
