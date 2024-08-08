import Phaser from "phaser";

import uiControlQueue, { MESSAGE_TYPE } from "../../util/UIControlQueue";
import { getRoomRepository } from "../../repository";

import eventBus from "../EventBus";

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
        this.load.image("foxHeadAlive", "assets/object/foxHeadAlive.png");
        this.load.image("foxHeadDead", "assets/object/foxHeadDead.png");
        this.load.image("racoonHeadAlive", "assets/object/racoonHeadAlive.png");
        this.load.image("racoonHeadDead", "assets/object/racoonHeadDead.png");

        this.load.image(
            "timer-progress-bar-background",
            `assets/ui/timer-progress-bar/background.png`
        );
    }

    create() {
        //이벤트리스너
        // 게임씬에서 remove-image 이벤트 감지해서 removeImage 호출
        eventBus.on("remove-image", this.removeImage, this);
        // 이미지를 배열로 관리
        this.images = [
            this.add.image(this.cameras.main.width / 10, 200, "foxHeadAlive"),
            this.add.image(this.cameras.main.width / 10, 150, "foxHeadAlive"),
            this.add.image(this.cameras.main.width / 10, 100, "foxHeadAlive"),
            this.add.image(this.cameras.main.width / 10, 50, "foxHeadAlive"),
        ];

        this.images = [
            this.add.image(
                (this.cameras.main.width * 9) / 10,
                200,
                "racoonHeadAlive"
            ),
            this.add.image(
                (this.cameras.main.width * 9) / 10,
                150,
                "racoonHeadAlive"
            ),
            this.add.image(
                (this.cameras.main.width * 9) / 10,
                100,
                "racoonHeadAlive"
            ),
            this.add.image(
                (this.cameras.main.width * 9) / 10,
                50,
                "racoonHeadAlive"
            ),
        ];

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

    //이벤트리스너
    removeImage() {
        if (this.images.length > 0) {
            console.log(this.images);
        }
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

        this.updateProgressBar();
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
