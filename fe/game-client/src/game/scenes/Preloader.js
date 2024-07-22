import { Scene } from 'phaser'

export class Preloader extends Scene {
  constructor() {
    super('Preloader')
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    // Boot Scene에서 이미지를 로드했기 때문에 여기서 표시할 수 있습니다.
    this.add.image(512, 384, 'background')

    // 간단한 로딩 현황 막대의 테두리입니다.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff)

    // 로딩 현황 막대로, 진행률에 따라 왼쪽에서 크기가 커집니다.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff)

    // LoaderPlugin에서 발생하는 'progress' 이벤트를 사용하여 로딩 막대를 업데이트합니다.
    this.load.on('progress', (progress) => {
      // 진행률 막대를 업데이트합니다. (막대의 너비는 464px이므로 100% = 464px)
      bar.width = 4 + 460 * progress
    })
  }

  preload() {
    // 게임에 필요한 에셋을 로드합니다. - 자체 에셋으로 교체하세요.
    this.load.setPath('assets')

    this.load.image('logo', 'logo.png')
    this.load.image('star', 'star.png')
  }

  create() {
    // 모든 에셋이 로드된 후에는 게임의 나머지 부분에서 사용할 수 있는 전역 객체를 여기서 만드는 것이 좋습니다.
    // 예를 들어, 여기서 전역 애니메이션을 정의할 수 있으므로 다른 씬에서 사용할 수 있습니다.

    // MainMenu으로 이동합니다. 카메라 페이드와 같은 씬 전환으로 교체할 수도 있습니다.
    this.scene.start('MainMenu')
  }
}
