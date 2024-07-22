import { Scene } from 'phaser'

export class Boot extends Scene {
  constructor() {
    super('Boot')
  }

  preload() {
    // Boot Scene은 보통 게임 로고나 배경과 같은 Preloader에 필요한 에셋을 로드하는 데 사용됩니다.
    // 에셋의 파일 크기가 작을수록 좋습니다. Boot Scene 자체에는 Preloader가 없습니다.
    this.load.image('background', 'assets/bg.png')
  }

  create() {
    this.scene.start('Preloader')
  }
}
