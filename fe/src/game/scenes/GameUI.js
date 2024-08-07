import Phaser from "phaser";

import uiControlQueue, { MESSAGE_TYPE } from "../../util/UIControlQueue";

export default class GameUI extends Phaser.Scene {
    constructor() {
        super({ key: "game-ui" });
    }

    preload() {
        this.load.image("racoonhead", "assets/object/racoonhead.png");
        this.load.image("foxhead", "assets/object/foxhead.png");
    }

    create() {
        //묶음으로 UI 만드는 법.
        // this.hearts = this.add.group({
        //     classType : Phaser.GameObjects.Image
        // })
        //key : 사용될 이미지, setXY : 위치 좌표(stepX는 UI 객체간 거리), quantity : UI 갯수
        // this.hearts.createMultiple({
        //     key : 'cattemp',
        //     setXY : {
        //         x: 10,
        //         y: 10,
        //         stepX : 70
        //     },
        //     quantity : 3
        // })
        // this.movingTeam= this.add.group({
        //     classType : Phaser.GameObjects.Image
        // })
        // this.movingTeam.createMultiple({
        //     key : 'racoonhead',
        //     setXY : {
        //         x: 100,
        //         y: 50,
        //         stepX : 0
        //     },
        //     quantity : 1
        // })
    }

    update() {
        if (uiControlQueue.hasGameUiControlMessage()) {
            const message = uiControlQueue.getGameUiControlMessage();
            switch (message.type) {
                case MESSAGE_TYPE.TOP_CENTER_MESSAGE:
                    this.showTopCenterMessage(message.data);
                    break;
                default:
                    break;
            }
        }
    }

    showTopCenterMessage(data) {
        const { phase, finishAfterMilliSec } = data;

        const message = `${phase} 페이즈가 시작되었습니다. ${
            finishAfterMilliSec / 1000
        }초 후 종료됩니다.`;
        const text = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 10,
            message,
            {
                font: "10px Arial",
                color: "#ffffff",
                backgroundColor: "#000000",
                align: "center",
                padding: {
                    left: 5,
                    right: 5,
                    top: 5,
                    bottom: 5,
                },
            }
        );
        text.setOrigin(0.5, 0.5);
        this.tweens.add({
            targets: text,
            alpha: 0,
            duration: 10000,
            ease: "Power1",
            onComplete: () => {
                text.destroy();
            },
        });
    }
}
