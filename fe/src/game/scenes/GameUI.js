import Phaser from "phaser";

import uiControlQueue, { MESSAGE_TYPE } from "../../util/UIControlQueue";
import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";

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
        }, 60);

        // 화면에 표시되어 있는 각 팀 플레이어 수
        this.drawnRacoonHeads = 0;
        this.drawnFoxHeads = 0;

        // 화면에 표시되어 있는 각 팀 죽은 플레이어 수
        this.deadRacoonHeads = 0;
        this.deadFoxHeads = 0;
    }

    preload() {
        this.load.image("foxHeadAlive", "assets/object/foxHeadAlive.png");
        this.load.image("foxHeadDead", "assets/object/foxHeadDead.png");
        this.load.image("racoonHeadAlive", "assets/object/racoonHeadAlive.png");
        this.load.image("racoonHeadDead", "assets/object/racoonHeadDead.png");
        this.load.image("failed", "assets/object/failed.png");

        this.load.image(
            "timer-progress-bar-background",
            `assets/ui/timer-progress-bar/background.png`
        );
    }

    #getNumOfRacoons() {
        return this.gameRepository.getRacoonTeam().getPlayers().length;
    }

    #getNumOfDeadRacoons() {
        return this.gameRepository
            .getRacoonTeam()
            .getPlayers()
            .filter((player) => player.getIsdead()).length;
    }

    #getNumOfFoxes() {
        return this.gameRepository.getFoxTeam().getPlayers().length;
    }

    #getNumOfDeadFoxes() {
        return this.gameRepository
            .getFoxTeam()
            .getPlayers()
            .filter((player) => player.getIsdead()).length;
    }

    create() {
        //초기화
        this.prevPlayer = null;

        this.groupRacoon = this.add.group();
        this.groupFox = this.add.group();

        //프로그래스 바
        this.groupTimer = this.add
            .image(
                this.cameras.main.width / 2,
                this.cameras.main.height + 10,
                "timer-progress-bar-background"
            )
            .setOrigin(0.6, 1)
            .setDisplaySize(this.cameras.main.width * 0.76, 60);

        // Add progress bar(red rectangle) on bar background
        this.progressBar = this.add
            .rectangle(
                this.cameras.main.width * 0.192,
                this.cameras.main.height * 0.978,
                this.getProgressBarFullWidth(),
                26,
                "0xFFB22C"
            )
            .setOrigin(0, 0.6);
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
        //ui 이미지 추가
        this.updateImage();

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

    updateImage() {
        // 화면에 아직 그려지지 않은 기본 머리 스프라이트만 새로 그려줌
        if (this.drawnFoxHeads < this.#getNumOfFoxes()) {
            for (
                let num = this.drawnFoxHeads + 1;
                num <= this.#getNumOfFoxes();
                num++
            ) {
                this.add
                    .image(
                        (this.cameras.main.width * 9) / 10,
                        (this.cameras.main.height * num) / 6,
                        "foxHeadAlive"
                    )
                    .setDisplaySize(80, 80);
            }
            // 머리 개수 갱신
            this.drawnFoxHeads = this.#getNumOfFoxes();
        }
        if (this.drawnRacoonHeads < this.#getNumOfRacoons()) {
            for (
                let num = this.drawnRacoonHeads + 1;
                num <= this.#getNumOfRacoons();
                num++
            ) {
                this.add
                    .image(
                        this.cameras.main.width / 10,
                        (this.cameras.main.height * num) / 6,
                        "racoonHeadAlive"
                    )
                    .setDisplaySize(80, 80);
            }
            this.drawnRacoonHeads = this.#getNumOfRacoons();
        }

        // 죽은 머리 스프라이트만 새로 그려줌
        if (this.deadFoxHeads < this.#getNumOfDeadFoxes()) {
            for (
                let num = this.deadFoxHeads + 1;
                num <= this.#getNumOfDeadFoxes();
                num++
            ) {
                this.add
                    .image(
                        this.cameras.main.width * 0.9,
                        (this.cameras.main.height * num) / 6,
                        "foxHeadDead"
                    )
                    .setDisplaySize(80, 80);
                this.add
                    .image(
                        this.cameras.main.width * 0.9,
                        (this.cameras.main.height * num) / 6,
                        "failed"
                    )
                    .setDisplaySize(80, 80);
            }
            this.deadFoxHeads = this.#getNumOfDeadFoxes();
        }

        if (this.deadRacoonHeads < this.#getNumOfDeadRacoons()) {
            for (
                let num = this.deadRacoonHeads + 1;
                num <= this.#getNumOfDeadRacoons();
                num++
            ) {
                this.add
                    .image(
                        this.cameras.main.width / 10 - 3,
                        (this.cameras.main.height * num + 3) / 6,
                        "racoonHeadDead"
                    )
                    .setDisplaySize(80, 80);
                this.add
                    .image(
                        this.cameras.main.width / 10 - 3,
                        (this.cameras.main.height * num + 3) / 6,
                        "failed"
                    )
                    .setDisplaySize(80, 80);
            }
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
        text.setOrigin(0.6, 0.6);
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
