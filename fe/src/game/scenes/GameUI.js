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

    create() {
        //초기화
        this.prevPlayer = null;
        this.racoonNum = 4;
        this.foxNum = 4;

        this.groupRacoon = this.add.group();
        this.groupFox = this.add.group();

        this.groupFox.add;
        this.add
            .image(
                (this.cameras.main.width * 9) / 10,
                (this.cameras.main.height * 1) / 6,
                "foxHeadAlive"
            )
            .setDisplaySize(80, 80),
            this.add
                .image(
                    (this.cameras.main.width * 9) / 10,
                    (this.cameras.main.height * 2) / 6,
                    "foxHeadAlive"
                )
                .setDisplaySize(80, 80),
            this.add
                .image(
                    (this.cameras.main.width * 9) / 10,
                    (this.cameras.main.height * 3) / 6,
                    "foxHeadAlive"
                )
                .setDisplaySize(80, 80),
            this.add
                .image(
                    (this.cameras.main.width * 9) / 10,
                    (this.cameras.main.height * 4) / 6,
                    "foxHeadAlive"
                )
                .setDisplaySize(80, 80),
            //라쿤 그룹에 추가
            this.groupRacoon.add;
        this.add
            .image(
                this.cameras.main.width / 10,
                (this.cameras.main.height * 1) / 6,
                "racoonHeadAlive"
            )
            .setDisplaySize(80, 80),
            this.add
                .image(
                    this.cameras.main.width / 10,
                    (this.cameras.main.height * 2) / 6,
                    "racoonHeadAlive"
                )
                .setDisplaySize(80, 80),
            this.add
                .image(
                    this.cameras.main.width / 10,
                    (this.cameras.main.height * 3) / 6,
                    "racoonHeadAlive"
                )
                .setDisplaySize(80, 80),
            this.add
                .image(
                    this.cameras.main.width / 10,
                    (this.cameras.main.height * 4) / 6,
                    "racoonHeadAlive"
                )
                .setDisplaySize(80, 80),
            //프로그래스 바
            (this.groupTimer = this.add
                .image(
                    this.cameras.main.width / 2,
                    this.cameras.main.height + 10,
                    "timer-progress-bar-background"
                )
                .setOrigin(0.6, 1)
                .setDisplaySize(this.cameras.main.width * 0.76, 60));

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
        if (!this.gameRepository.getCurrentEliminatedPlayerAndTeam()) {
            return;
        }

        const EliminatedPlayerAndTeam =
            this.gameRepository.getCurrentEliminatedPlayerAndTeam();
        const prevPlayer = this.prevPlayer; // 이전에 탈락한플레이어, create에서 null로 초기화되어있음
        const nowPlayer = EliminatedPlayerAndTeam.playerId; // 현재 탈락한 플레이어

        //새로운 플레이어 찾을떄마다 이미지 덮어서 로드
        // 죽은 이미지 && failed 이미지 
        if (prevPlayer !== nowPlayer) {
            if (EliminatedPlayerAndTeam.team === "RACOON") {
                if (this.racoonNum === 4) {
                    console.log("첫 번째 너구리 탈락");
                    this.groupRacoon.add;
                    this.add
                        .image(
                            this.cameras.main.width / 10 - 3,
                            (this.cameras.main.height * 1 + 3) / 6,
                            "racoonHeadDead"
                        )
                        .setDisplaySize(80, 80);
                    this.add
                        .image(
                            this.cameras.main.width / 10 - 3,
                            (this.cameras.main.height * 1 + 3) / 6,
                            "failed"
                        )
                        .setDisplaySize(80, 80);
                    this.racoonNum--;
                } else if (this.racoonNum === 3) {
                    console.log("두 번째 너구리 탈락");
                    this.groupRacoon.add;
                    this.add
                        .image(
                            this.cameras.main.width / 10 - 3,
                            (this.cameras.main.height * 2 + 3) / 6,
                            "racoonHeadDead"
                        )
                        .setDisplaySize(80, 80);
                    this.add
                        .image(
                            this.cameras.main.width / 10 - 3,
                            (this.cameras.main.height * 2 + 3) / 6,
                            "failed"
                        )
                        .setDisplaySize(80, 80);
                    this.racoonNum--;
                } else if (this.racoonNum === 2) {
                    console.log("세 번째 너구리 탈락");
                    this.groupRacoon.add;
                    this.add
                        .image(
                            this.cameras.main.width / 10 - 3,
                            (this.cameras.main.height * 3 + 3) / 6,
                            "racoonHeadAlive"
                        )
                    this.add
                        .image(
                            this.cameras.main.width / 10 - 3,
                            (this.cameras.main.height * 3 + 3) / 6,
                            "failed"
                        )
                        .setDisplaySize(80, 80);
                    this.racoonNum--;
                } else {
                    console.log("마지막 너구리 탈락");
                    this.groupRacoon.add;
                    this.add
                        .image(
                            this.cameras.main.width / 10 - 3,
                            (this.cameras.main.height * 4 + 3) / 6,
                            "racoonHeadAlive"
                        )
                        .setDisplaySize(80, 80);
                    this.add
                        .image(
                            this.cameras.main.width / 10 - 3,
                            (this.cameras.main.height * 4 + 3) / 6,
                            "failed"
                        )
                        .setDisplaySize(80, 80);
                }
            } else {
                if (this.foxNum === 4) {
                    console.log("첫 번째 여우 탈락");
                    this.groupFox.add;
                    this.add
                        .image(
                            (this.cameras.main.width * 9) / 10,
                            (this.cameras.main.height * 1) / 6,
                            "foxHeadDead"
                        )
                        .setDisplaySize(80, 80);
                    this.add
                        .image(
                            (this.cameras.main.width * 9) / 10,
                            (this.cameras.main.height * 1) / 6,
                            "failed"
                        )
                        .setDisplaySize(80, 80);
                    this.foxNum--;
                } else if (this.foxNum === 3) {
                    console.log("두 번째 여우 탈락");
                    this.groupFox.add;
                    this.add
                        .image(
                            (this.cameras.main.width * 9) / 10,
                            (this.cameras.main.height * 2) / 6,
                            "foxHeadDead"
                        )
                        .setDisplaySize(80, 80);
                    this.add
                        .image(
                            (this.cameras.main.width * 9) / 10,
                            (this.cameras.main.height * 2) / 6,
                            "failed"
                        )
                        .setDisplaySize(80, 80);
                    this.foxNum--;
                } else if (this.racoonNum === 2) {
                    console.log("세 번째 여우 탈락");
                    this.groupFox.add;
                    this.add
                        .image(
                            (this.cameras.main.width * 9) / 10,
                            (this.cameras.main.height * 3) / 6,
                            "foxHeadDead"
                        )
                        .setDisplaySize(80, 80);
                    this.add
                        .image(
                            (this.cameras.main.width * 9) / 10,
                            (this.cameras.main.height * 3) / 6,
                            "failed"
                        )
                        .setDisplaySize(80, 80);
                    this.foxNum--;
                } else {
                    console.log("마지막 여우 탈락");
                    this.groupFox.add;
                    this.add
                        .image(
                            (this.cameras.main.width * 9) / 10,
                            (this.cameras.main.height * 4) / 6,
                            "foxHeadDead"
                        )
                        .setDisplaySize(80, 80);
                    this.add
                        .image(
                            (this.cameras.main.width * 9) / 10,
                            (this.cameras.main.height * 4) / 6,
                            "failed"
                        )
                        .setDisplaySize(80, 80);
                }
            }
            //기존의플레이어 업데이트
            this.prevPlayer = nowPlayer;
        }
    }

    ///

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
