import Phaser from "phaser";

import uiControlQueue, { MESSAGE_TYPE } from "../../util/UIControlQueue";
import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";

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
                this.cameras.main.height + 10,
                "timer-progress-bar-background"
            )
            .setOrigin(0.5, 1)
            .setDisplaySize(this.cameras.main.width * 0.75, 60);

        // Add progress bar(red rectangle) on bar background
        this.progressBar = this.add
            .rectangle(
                this.cameras.main.width * 0.192,
                this.cameras.main.height * 0.978,
                this.getProgressBarFullWidth(),
                25,
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

        const restSeconds = Math.floor(finishAfterMilliSec / 1000);
        const messageTokens = [];
        if (phase === Phase.READY) {
            if (this.gameRepository.getMe().isHidingTeam()) {
                messageTokens.push(
                    `앞으로 ${restSeconds}초 동안 숨어야한다구리!`
                );
            } else {
                messageTokens.push(
                    `앞으로 ${restSeconds}초 뒤에 찾아야한다구리!`
                );
            }
        } else if (phase === Phase.MAIN) {
            const foeAnimal = this.gameRepository.getMe().isRacoonTeam()
                ? "여우"
                : "너구리";
            if (this.gameRepository.getMe().isHidingTeam()) {
                messageTokens.push(`${foeAnimal}들이 쫓아오고 있다구리!`);
            } else {
                messageTokens.push(`${foeAnimal}들을 찾아야한다구리!`);
            }
        }

        const message = messageTokens.join(" ");
        const text = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 10,
            message,
            {
                font: "30px Arial",
                color: "#ffffff",
                backgroundColor: "#000000aa",
                align: "center",
                fontSize: 20,
                padding: {
                    left: 8,
                    right: 8,
                    top: 8,
                    bottom: 8,
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
