import Phaser from "phaser";

import uiControlQueue, { MESSAGE_TYPE } from "../../util/UIControlQueue";
import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";
import { game } from "./Game";
import { PLAYER_ELIMINATION_REASON } from "../../repository/interface";

export default class GameUI extends Phaser.Scene {
    static progressBarAssetPrefix = "progress-bar-01-";
    static DEFAULT_SEEK_COUNT = 5;

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

        // 화면에 표시되어 있는 남은 찾기 횟수
        this.drawnMagnifier = 0;
        this.isMagnifierVisible = false;

        // 중앙 상단 메시지가 떠있는지 여부
        this.isTopCenterMessageVisible = false;

        // 플레이어의 사망 기록을 화면에 하나씩만 보여 주기 위한 큐와 변수
        this.killLogQueue = [];
        this.isDisplayingKillLog = false;
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

        this.load.image(
            "chickenEffectImage",
            "assets/object/chickenEffectImage.png"
        );
        this.load.image(
            "chickenEffectPhoto",
            "assets/object/chickenEffectPhoto.png"
        );

        this.load.image("magnifier-item", "assets/object/item/glassItem.png");

        this.load.image(
            "chickenEffectImage",
            "assets/object/chickenEffectImage.png"
        );
        this.load.image(
            "chickenEffectPhoto",
            "assets/object/chickenEffectPhoto.png"
        );
    }

    async #getNumOfRacoons() {
        return getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                return gameRepository.getRacoonTeam().getPlayers().length;
            });
    }

    async #getNumOfDeadRacoons() {
        return getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                return gameRepository
                    .getRacoonTeam()
                    .getPlayers()
                    .filter((player) => player.isDead()).length;
            });
    }

    async #getNumOfFoxes() {
        return getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                return gameRepository.getFoxTeam().getPlayers().length;
            });
    }

    async #getNumOfDeadFoxes() {
        return getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                return gameRepository
                    .getFoxTeam()
                    .getPlayers()
                    .filter((player) => player.isDead()).length;
            });
    }

    create() {
        // 치킨 이펙트 관리할 배열, 초기 찾기 실패 횟수 
        this.chickenEffects = [];
        this.prevseekFailCount = 0; 

        //초기화
        this.prevPlayer = null;

        this.groupRacoon = this.add.group();
        this.groupFox = this.add.group();

        //프로그래스 바
        this.groupTimer = this.add
            .image(
                this.cameras.main.width / 2,
                this.cameras.main.height,
                "timer-progress-bar-background"
            )
            .setOrigin(0.5, 1)
            .setDisplaySize(this.cameras.main.width * 0.76, 60);

        // Add progress bar(red rectangle) on bar background
        this.progressBar = this.add
            .rectangle(
                this.cameras.main.width * 0.184,
                this.cameras.main.height - 27,
                this.getProgressBarFullWidth(),
                29.5,
                "0x00ff00"
            )
            .setOrigin(0, 0.6);

        this.magnifierIcon = this.add
            .image(
                this.cameras.main.width - 100,
                this.cameras.main.height - 50,
                "magnifier-item"
            )
            .setDisplaySize(60, 60);
        this.magnifierIcon.visible = false;

        this.counterText = this.add.text(
            this.cameras.main.width - 70,
            this.cameras.main.height - 64,
            `X ${GameUI.DEFAULT_SEEK_COUNT}`,
            {
                fontSize: "30px",
                color: "#ffffff",
                fontFamily: "m6x11",
            }
        );
        this.counterText.visible = false;

        // 닭소리
        this.surprisingChickenSound = this.sound.add("surprising-chicken", {
            volume: 1,
        });
        this.initializeChickenHeads();

        // 아군 탐색 성공 사운드
        this.allySeekSuccessSound = this.sound.add("hp-seek-success", {
            volume: 1,
        });

        // 아군 탐색 실패 사운드
        this.allySeekFailSound = this.sound.add("hp-seek-fail", {
            volume: 1,
        });

        // 적군 탐색 성공 사운드
        this.enemySeekSuccessSound = this.sound.add("hp-seek-fail", {
            volume: 1,
        });

        // 아군 사망 사운드
        this.allyDeadSound = this.sound.add("player-dead", {
            volume: 1,
        });
    }

    initializeChickenHeads() {
        this.chickenHeads = [];

        // 왼쪽 아래부터 반시계방향
        const chickenHead1 = this.add.image(
            100,
            this.cameras.main.height - 200,
            "chicken-head-1"
        );
        this.chickenHeads.push(chickenHead1);

        const chickenHead2 = this.add.image(
            this.cameras.main.width - 100,
            this.cameras.main.height - 100,
            "chicken-head-1"
        );
        chickenHead2.setFlipX(true);
        chickenHead2.setScale(1.5);
        this.chickenHeads.push(chickenHead2);

        const chickenHead3 = this.add.image(
            this.cameras.main.width - 200,
            100,
            "chicken-head-1"
        );
        chickenHead3.setFlipX(true);
        chickenHead3.setFlipY(true);
        chickenHead3.setRotation(1.0);
        this.chickenHeads.push(chickenHead3);

        const chickenHead4 = this.add.image(100, 200, "chicken-head-1");
        chickenHead4.setRotation(2.0);
        chickenHead4.setScale(1, 1);
        this.chickenHeads.push(chickenHead4);

        const chickenHead5 = this.add.image(
            this.cameras.main.width / 2,
            300,
            "chicken-head-1"
        );
        chickenHead5.setFlipY(true);
        chickenHead5.setScale(1.5);
        this.chickenHeads.push(chickenHead5);

        // 일단 모두 숨기기
        this.chickenHeads.forEach((chickenHead) => {
            chickenHead.visible = false;
        });
    }

    updateProgressBar() {
        getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                const nextPhaseChangeAt = gameRepository.getNextPhaseChangeAt();
                if (nextPhaseChangeAt) {
                    const now = new Date().getTime();
                    const remainMilliSec = nextPhaseChangeAt - now;
                    const percentage =
                        remainMilliSec /
                        gameRepository.getCurrentPhaseFinishAfterMilliSec();
                    this.progressBar.width =
                        this.getProgressBarFullWidth() * percentage;

                    const color = this.interpolateColor(
                        0xff0000, // Red
                        0xffff00, // Yellow
                        0x00ff00, // Green
                        percentage
                    );
                    this.progressBar.fillColor = color;
                }
            });
    }

    interpolateColor(color1, color2, color3, factor) {
        let r1, g1, b1, r2, g2, b2;

        if (factor <= 0.5) {
            // Interpolate between color1 (red) and color2 (yellow)
            factor *= 2;
            r1 = (color1 >> 16) & 0xff;
            g1 = (color1 >> 8) & 0xff;
            b1 = color1 & 0xff;

            r2 = (color2 >> 16) & 0xff;
            g2 = (color2 >> 8) & 0xff;
            b2 = color2 & 0xff;
        } else {
            // Interpolate between color2 (yellow) and color3 (green)
            factor = (factor - 0.5) * 2;
            r1 = (color2 >> 16) & 0xff;
            g1 = (color2 >> 8) & 0xff;
            b1 = color2 & 0xff;

            r2 = (color3 >> 16) & 0xff;
            g2 = (color3 >> 8) & 0xff;
            b2 = color3 & 0xff;
        }

        const r = Math.round(r1 + factor * (r2 - r1));
        const g = Math.round(g1 + factor * (g2 - g1));
        const b = Math.round(b1 + factor * (b2 - b1));

        return (r << 16) | (g << 8) | b;
    }

    getProgressBarFullWidth() {
        return this.cameras.main.width * 0.635;
    }

    update() {
        // 화면에 띄우고 있는 킬 로그는 없는데 띄워야 할 킬 로그가 있을 때
        if (!this.isDisplayingKillLog && this.killLogQueue.length > 0) {
            // 화면에 킬 로그 띄우기
            const killLog = this.killLogQueue.shift();
            this.isDisplayingKillLog = true;
            this.#showKillLog(killLog);
        }

        getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                //ui 이미지 추가
                this.updateImage();

                if (uiControlQueue.hasGameUiControlMessage()) {
                    const message = uiControlQueue.getGameUiControlMessage();
                    switch (message.type) {
                        case MESSAGE_TYPE.TOP_CENTER_MESSAGE:
                            this.showTopCenterMessage(message.data);
                            break;
                        case MESSAGE_TYPE.HIDE_SEEK_COUNT_UI:
                            this.#hideSeekCountUi();
                            break;
                        case MESSAGE_TYPE.SHOW_SEEK_COUNT_UI:
                            this.#showSeekCountUi();
                            break;
                        case MESSAGE_TYPE.UPDATE_SEEK_COUNT_UI:
                            this.#updateSeekCountUi(message.data.restSeekCount);
                            break;
                        case MESSAGE_TYPE.SURPRISE_CHICKEN:
                            this.doChickenSurprise();
                            break;
                        case MESSAGE_TYPE.PLAYER_DEAD:
                            this.#announcePlayerElimination(message.data);
                            break;
                        default:
                            break;
                    }
                }
                if (
                    gameRepository.getMe().then((me) => {
                        // 닭 보여주는 이벤트, 숨는팀이면 보이지않음
                        this.showChickenEffect(
                            me.isHidingTeam(),
                            gameRepository.getSeekFailCount()
                        );
                    })
                )
                    if (uiControlQueue.hasGameUiControlMessage()) {
                        // } else{
                        // '찾는팀'
                        // }

                        const message =
                            uiControlQueue.getGameUiControlMessage();
                        switch (message.type) {
                            case MESSAGE_TYPE.TOP_CENTER_MESSAGE:
                                this.showTopCenterMessage(message.data);
                                break;
                            default:
                                break;
                        }
                    }

                if (gameRepository.getIsEnd()) {
                    this.progressBar.width = 0;
                } else {
                    this.updateProgressBar();
                }
            });
    }

    showChickenEffect(isHidingTeam, seekFailCount) {
        // if (!this.chickenEffects) {
        //     this.chickenEffects = [];
        // }
        if (isHidingTeam) {
            // 전부 안보이게 하기 
            this.chickenEffects.forEach((effect) => effect.setVisible(false));
            return;
        }
        // 전부 보이게 만들기
        // this.chickenEffects.forEach((effect) => effect.setVisible(true));
        if (seekFailCount > this.prevseekFailCount) {
            console.log("실패이펙트 함수 실행");
            console.log("카메라 찾기");
            const camera = this.cameras.main;
            const width = camera.width;
            const height = camera.height;
            let x, y;
            // 1,2는 fliped 이미지로 넣기 
            switch (seekFailCount) {
                case 1:
                    (x = 20), (y = 20);
                    break;
                case 2:
                    (x = width - 20), (y = 20);
                    break;
                case 3:
                    (x = 20), (y = height - 20);
                    break;
                default:
                    x = width - 20;
                    y = height - 20;
            }
            console.log("이미지추가");
            const newEffect = this.add
                .image(x, y, "chickenEffectImage")
                .setOrigin(0.5);
            // 배열에 추가 
            this.chickenEffects.push(newEffect);
            // 탐색 횟수 업데이트 
            this.prevseekFailCount = seekFailCount;
        }
    }

    async updateImage() {
        // 화면에 아직 그려지지 않은 기본 머리 스프라이트만 새로 그려줌
        if (this.drawnFoxHeads < (await this.#getNumOfFoxes())) {
            for (
                let num = this.drawnFoxHeads + 1;
                num <= (await this.#getNumOfFoxes());
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
            this.drawnFoxHeads = await this.#getNumOfFoxes();
        }
        if (this.drawnRacoonHeads < (await this.#getNumOfRacoons())) {
            for (
                let num = this.drawnRacoonHeads + 1;
                num <= (await this.#getNumOfRacoons());
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
            this.drawnRacoonHeads = await this.#getNumOfRacoons();
        }

        // 죽은 머리 스프라이트만 새로 그려줌
        if (this.deadFoxHeads < (await this.#getNumOfDeadFoxes())) {
            for (
                let num = this.deadFoxHeads + 1;
                num <= (await this.#getNumOfDeadFoxes());
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
            this.deadFoxHeads = await this.#getNumOfDeadFoxes();
        }

        if (this.deadRacoonHeads < (await this.#getNumOfDeadRacoons())) {
            for (
                let num = this.deadRacoonHeads + 1;
                num <= (await this.#getNumOfDeadRacoons());
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

        getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                if (this.isTopCenterMessageVisible) {
                    return;
                }
                this.isTopCenterMessageVisible = true;

                gameRepository.getMe().then((me) => {
                    if (phase === Phase.READY) {
                        if (me.isHidingTeam()) {
                            messageTokens.push(
                                `앞으로 ${restSeconds}초 동안 숨어야한다구리!`
                            );
                        } else {
                            messageTokens.push(
                                `앞으로 ${restSeconds}초 뒤에 찾아야한다구리!`
                            );
                        }
                    } else if (phase === Phase.MAIN) {
                        const foeAnimal = me.isRacoonTeam() ? "여우" : "너구리";
                        if (me.isHidingTeam()) {
                            messageTokens.push(
                                `${foeAnimal}들이 쫓아오고 있다구리!`
                            );
                        } else {
                            messageTokens.push(
                                `${foeAnimal}들을 찾아야한다구리!`
                            );
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
                            this.isTopCenterMessageVisible = false;
                        },
                    });
                });
            });
    }

    #announcePlayerElimination(message) {
        const { reasonType, data } = message;
        const { victimPlayerNickname } = data;

        let messageText = "";
        switch (reasonType) {
            case PLAYER_ELIMINATION_REASON.CAUGHT:
                const { attackerNickname } = data;
                messageText = `[${victimPlayerNickname}]님이 [${attackerNickname}]님에게 들켰습니다.`;
                break;
            case PLAYER_ELIMINATION_REASON.FAILED_TO_HIDE:
                messageText = `[${victimPlayerNickname}]님이 시간 안에 숨지 못했습니다.`;
                break;
            case PLAYER_ELIMINATION_REASON.OUT_OF_SAFE_ZONE:
                messageText = `[${victimPlayerNickname}]님이 금지 구역에 포함되었습니다.`;
                break;
            case PLAYER_ELIMINATION_REASON.PLAYER_DISCONNECTED:
                messageText = `[${victimPlayerNickname}]님이 게임에서 이탈했습니다.`;
                break;
        }

        this.killLogQueue.push(messageText);
    }

    #hideSeekCountUi() {
        this.magnifierIcon.visible = false;
        this.counterText.visible = false;
    }

    #showSeekCountUi() {
        this.magnifierIcon.visible = true;
        this.counterText.visible = true;
        this.counterText.text = `X ${GameUI.DEFAULT_SEEK_COUNT}`;
    }

    #updateSeekCountUi(restSeekCount) {
        this.counterText.text = `X ${restSeekCount}`;
    }

    doChickenSurprise() {
        // 닭 울음 소리 재생하고
        this.surprisingChickenSound.play();
        // 3초 뒤에 사라지는 닭 머리들을 화면에 띄움
        // 단, 랜덤하게 1~3개만 띄움
        const numChickenHeadsToShow = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numChickenHeadsToShow; i++) {
            const chickenHead = this.chickenHeads[i];
            chickenHead.visible = true;
            this.tweens.add({
                targets: chickenHead,
                alpha: 0,
                duration: 5000,
                ease: "Power1",
                onComplete: () => {
                    chickenHead.visible = false;
                },
            });
        }
    }

    #showKillLog(messageText) {
        const text = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 5,
            messageText,
            {
                fontFamily: "m6x11",
                color: "#ffffff",
                backgroundColor: "#ff0000aa",
                align: "center",
                fontSize: 20,
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10,
                },
            }
        );
        text.setOrigin(0.5, 0.5);

        this.tweens.add({
            targets: text,
            alpha: 0,
            duration: 3000,
            ease: "Power1",
            onComplete: () => {
                text.destroy();
                this.isDisplayingKillLog = false;
            },
        });
    }
}
