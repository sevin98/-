import Phaser from "phaser";
import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";




export default class otherPlayer extends Phaser.Physics.Arcade.Sprite {
    static PLAYER_SPEED = 200;
    static moveX = [0, 1, 0, -1];
    static moveY = [-1, 0, 1, 0];

    constructor(scene, x, y, texture,id) {
        super(scene, x, y, texture,id);

        this.id = id;
        this.scale = 1;
        this.alpha = 1;
        this.setDepth(10); //화면 제일 앞에 렌더링

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 스프라이트의 표시 크기를 1px * 1px로 설정
        this.setDisplaySize(16, 16);
        // 물리 바디의 크기를 1px * 1px로 설정
        this.body.setSize(28, 28);

        this.roomRepository = getRoomRepository();
        this.gameRepository = this.roomRepository.getGameRepository();
        this.isRacoon = this.gameRepository.getPlayerWithId(id).isRacoonTeam();

        this.setupAnimations();
    }

    //애니메이션
    setupAnimations() {
        //racoon animation
        if (this.isRacoon) {
            this.anims.create({
                key: "racoon-idle-down",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 2,
                    prefix: "idle-down-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 5,
            });

            this.anims.create({
                key: "racoon-idle-right",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 2,
                    prefix: "idle-right-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 5,
            });
            this.anims.create({
                key: "racoon-idle-left",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 2,
                    prefix: "idle-left-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 5,
            });

            this.anims.create({
                key: "racoon-idle-up",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 2,
                    prefix: "idle-up-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 5,
            });

            this.anims.create({
                key: "racoon-run-down",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 4,
                    prefix: "run-down-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.create({
                key: "racoon-run-up",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 4,
                    prefix: "run-up-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.create({
                key: "racoon-run-right",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 4,
                    prefix: "run-right-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });
            this.anims.create({
                key: "racoon-run-left",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 4,
                    prefix: "run-left-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.play("racoon-idle-down");
        } else if (!this.isRacoon) {
            this.anims.create({
                key: "fox-idle-down",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 2,
                    prefix: "idle-down-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 5,
            });

            this.anims.create({
                key: "fox-idle-right",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 2,
                    prefix: "idle-right-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 5,
            });
            this.anims.create({
                key: "fox-idle-left",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 2,
                    prefix: "idle-left-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 5,
            });

            this.anims.create({
                key: "fox-idle-up",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 2,
                    prefix: "idle-up-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 5,
            });

            this.anims.create({
                key: "fox-run-down",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 4,
                    prefix: "run-down-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.create({
                key: "fox-run-up",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 4,
                    prefix: "run-up-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.create({
                key: "fox-run-right",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 4,
                    prefix: "run-right-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });
            this.anims.create({
                key: "fox-run-left",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 4,
                    prefix: "run-left-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.play("fox-idle-down");
        }
    }
    //벽부딫힐때 움직임
    reflectFromWall(headDir) {
        this.x -= otherPlayer.moveX[headDir] * otherPlayer.PLAYER_SPEED;
        this.y -= otherPlayer.moveY[headDir] * otherPlayer.PLAYER_SPEED;
    }

    stopMove(headDir) {
        this.setVelocityX(0);
        this.setVelocityY(0);
        if (this.isRacoon) {
            switch (headDir) {
                case 0:
                    if (this.anims.currentAnim.key != "racoon-idle-up")
                        this.anims.play("racoon-idle-up");
                    break;
                case 1:
                    if (this.anims.currentAnim.key != "racoon-idle-right")
                        this.anims.play("racoon-idle-right");
                    break;
                case 2:
                    if (this.anims.currentAnim.key != "racoon-idle-down")
                        this.anims.play("racoon-idle-down");
                    break;
                case 3:
                    if (this.anims.currentAnim.key != "racoon-idle-left")
                        this.anims.play("racoon-idle-left");
                    break;
            }
        } else if (!this.isRacoon) {
            switch (headDir) {
                case 0:
                    if (this.anims.currentAnim.key != "fox-idle-up")
                        this.anims.play("fox-idle-up");
                    break;
                case 1:
                    if (this.anims.currentAnim.key != "fox-idle-right")
                        this.anims.play("fox-idle-right");
                    break;
                case 2:
                    if (this.anims.currentAnim.key != "fox-idle-down")
                        this.anims.play("fox-idle-down");
                    break;
                case 3:
                    if (this.anims.currentAnim.key != "fox-idle-left")
                        this.anims.play("fox-idle-left");
                    break;
            }
        }
    }
    move(headDir) {
        this.setVelocityX(
            otherPlayer.moveX[headDir] * otherPlayer.PLAYER_SPEED
        );
        this.setVelocityY(
            otherPlayer.moveY[headDir] * otherPlayer.PLAYER_SPEED
        );
        if(this.isRacoon){
            // 애니메이션 업데이트
            if (headDir === 0) {
                // Up
                this.anims.play("racoon-run-up");
            } else if (headDir === 1) {
                // Right
                this.anims.play("racoon-run-right");
            } else if (headDir === 2) {
                // Down
                this.anims.play("racoon-run-down");
            } else if (headDir === 3) {
                // Left
                this.anims.play("racoon-run-left");
            }
        } else{
            if (headDir === 0) {
                // Up
                this.anims.play("fox-run-up");
            } else if (headDir === 1) {
                // Right
                this.anims.play("fox-run-right");
            } else if (headDir === 2) {
                // Down
                this.anims.play("fox-run-down");
            } else if (headDir === 3) {
                // Left
                this.anims.play("fox-run-left");
            }

        }


    }


}