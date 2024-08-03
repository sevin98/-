import Phaser from "phaser";
import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";

export default class otherPlayer extends Phaser.Physics.Arcade.Sprite {
    static PLAYER_SPEED = 200;
    static moveX = [0, 1, 0, -1];
    static moveY = [-1, 0, 1, 0];

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scale = 1;
        this.alpha = 1;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 스프라이트의 표시 크기를 1px * 1px로 설정
        this.setDisplaySize(16, 16);
        // 물리 바디의 크기를 1px * 1px로 설정
        this.body.setSize(28, 28);
        
        // this.roomRepository = getRoomRepository();
        // this.gameRepository = this.roomRepository.getGameRepository();
        // this.isRacoon = this.gameRepository.getPlayerwith(this.id).isRacoonTeam();
        // this.isHidingTeam = this.gameRepository.getPlayerwith(this.id).isHidingTeam();
        
        this.isRacoon = true;
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
    reflectFromWall(direction) {
        this.x -= otherPlayer.moveX[direction] * otherPlayer.PLAYER_SPEED;
        this.y -= otherPlayer.moveY[direction] * otherPlayer.PLAYER_SPEED;
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
    //특정 phase에 움직일수있는지 확인 
    // canMove() {
    //     const currentPhase = this.gameRepository.getCurrentPhase();
    //     return (
    //         (this.gameRepository.getplayerwith(this.id).isHidingTeam() &&
    //             currentPhase === Phase.READY) ||
    //         (this.gameRepository.getplayerwith(this.id).isSeekingTeam() &&
    //             currentPhase === Phase.MAIN)
    //     );
    // }
}

