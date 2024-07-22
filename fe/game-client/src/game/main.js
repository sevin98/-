import { Boot } from './scenes/Boot'
import { Game } from './scenes/Game'
import { GameOver } from './scenes/GameOver'
import { MainMenu } from './scenes/MainMenu'
import Phaser from 'phaser'
import { Preloader } from './scenes/Preloader'

// 게임 설정에 대한 자세한 정보는 다음에서 확인할 수 있습니다.
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scene: [Boot, Preloader, MainMenu, Game, GameOver]
}

const StartGame = (parent) => {
  return new Phaser.Game({ ...config, parent })
}

export default StartGame
