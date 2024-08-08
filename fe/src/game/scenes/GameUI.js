import Phaser from "phaser";

import uiControlQueue, { MESSAGE_TYPE } from "../../util/UIControlQueue";
import { getRoomRepository } from "../../repository";

export default class GameUI extends Phaser.Scene {
    static progressBarAssetPrefix = "progress-bar-01-";

    constructor() {
        super({ key: "game-ui" });

        const gameRepositoryTrial = setInterval(() => {
            if (getRoomRepository()) {
                this.gameRepository = getRoomRepository().getGameRepository();
                clearInterval(gameRepositoryTrial);
            }
        }, 50);
    }

    preload() {
        this.load.image("racoonhead", "assets/object/racoonhead.png");
        this.load.image("foxhead", "assets/object/foxhead.png");

        this.load.image(
            "timer-progress-bar-background",
            `assets/ui/timer-progress-bar/background.png`
        );
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

        this.add
            .image(
                this.cameras.main.width / 2,
                this.cameras.main.height,
                "timer-progress-bar-background"
            )
            .setOrigin(0.5, 1)
            .setDisplaySize(this.cameras.main.width * 0.75, 15);

        // Add progress bar(red rectangle) on bar background
        this.progressBar = this.add
            .rectangle(
                this.cameras.main.width * 0.192,
                this.cameras.main.height * 0.97,
                this.getProgressBarFullWidth(),
                5,
                "0xFFB22C"
            )
            .setOrigin(0, 0.5);
    }

    updateProgressBar() {
        if (!this.gameRepository) {
            return;
        }

        const nextPhaseChangeAt = this.gameRepository.getNextPhaseChangeAt();
        if (nextPhaseChangeAt) {
            const now = new Date().getTime();
            const remainMilliSec = nextPhaseChangeAt - now;
            const percentage =
                remainMilliSec /
                this.gameRepository.getCurrentPhaseFinishAfterMilliSec();
            this.progressBar.width =
                this.getProgressBarFullWidth() * percentage;
        }
    }

    getProgressBarFullWidth() {
        return this.cameras.main.width * 0.62;
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

        if (this.gameRepository.getIsEnd()) {
            this.progressBar.width = 0;
        } else {
            this.updateProgressBar();
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
