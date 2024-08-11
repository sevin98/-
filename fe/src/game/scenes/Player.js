import Phaser from "phaser";

import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";

// import webSocketClient from '../network/index'

//키인식
export const Direction = Object.freeze({
    Up: "Up",
    Down: "Down",
    Left: "Left",
    Right: "Right",
});

export class HandlePlayerMove {
    //player 키조작
    constructor(cursors, player, headDir, moving) {
        this.m_cursorKeys = cursors;
        this.localPlayer = player;
        this.headDir = headDir;
        this.moving = moving;

        this.roomRepository = getRoomRepository();
    }

    freezePlayerMovement() {
        this.localPlayer.stopMove();
    }
    enablePlayerMovement() {
        this.isMovementEnabled = true;
    }

    canMove() {
        return this.localPlayer.canMove();
    }

    update() {
        if (!this.canMove()) {
            this.freezePlayerMovement();
            return;
        }

        if (
            this.m_cursorKeys.left.isUp &&
            this.m_cursorKeys.right.isUp &&
            this.m_cursorKeys.down.isUp &&
            this.m_cursorKeys.up.isUp
        ) {
            this.moving = 0;
        }
        if (this.m_cursorKeys.left.isDown) {
            if ((this.moving == 1 && this.headDir == 3) || this.moving == 0) {
                this.localPlayer.move(Direction.Left);
                this.headDir = 3;
                this.moving = 1;
            }
        }
        if (this.m_cursorKeys.right.isDown) {
            if ((this.moving == 1 && this.headDir == 1) || this.moving == 0) {
                this.localPlayer.move(Direction.Right);
                this.headDir = 1;
                this.moving = 1;
            }
        }
        if (this.m_cursorKeys.up.isDown) {
            if ((this.moving == 1 && this.headDir == 0) || this.moving == 0) {
                this.localPlayer.move(Direction.Up);
                this.headDir = 0;
                this.moving = 1;
            }
        }
        if (this.m_cursorKeys.down.isDown) {
            if ((this.moving == 1 && this.headDir == 2) || this.moving == 0) {
                this.localPlayer.move(Direction.Down);
                this.headDir = 2;
                this.moving = 1;
            }
        }
        if (
            this.moving == 0 ||
            (this.moving == 1 &&
                this.headDir == 0 &&
                !this.m_cursorKeys.up.isDown) ||
            (this.moving == 1 &&
                this.headDir == 1 &&
                !this.m_cursorKeys.right.isDown) ||
            (this.moving == 1 &&
                this.headDir == 2 &&
                !this.m_cursorKeys.down.isDown) ||
            (this.moving == 1 &&
                this.headDir == 3 &&
                !this.m_cursorKeys.left.isDown)
        ) {
            this.moving = 0;
            this.localPlayer.stopMove(this.headDir);
        }

        this.roomRepository.getGameRepository().then((gameRepository) => {
            gameRepository.setMyPosition({
                x: this.localPlayer.x,
                y: this.localPlayer.y,
                direction: this.getDirectionOfPlayer(),
            });
        });
    }
    getDirectionOfPlayer() {
        switch (this.headDir) {
            case 0:
                return "UP";
            case 1:
                return "RIGHT";
            case 2:
                return "DOWN";
            case 3:
                return "LEFT";
        }
    }
}
export default class MyPlayerSprite extends Phaser.Physics.Arcade.Sprite {
    static PLAYER_SPEED = 200;
    static moveX = [0, 1, 0, -1];
    static moveY = [-1, 0, 1, 0];

    #canMove = true;

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scale = 1;
        this.alpha = 1;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        //   this.body.setSize(this.width * 0.1, this.height * 0.1);

        // 스프라이트의 표시 크기를 1px * 1px로 설정
        this.setDisplaySize(16, 16);
        // 물리 바디의 크기를 1px * 1px로 설정
        this.body.setSize(28, 28);

        this.roomRepository = getRoomRepository();

        this.roomRepository.getGameRepository().then((gameRepository) => {
            gameRepository.getMe().then((me) => {
                me.setSprite(this);

                //racoon animation
                if (me.isRacoonTeam()) {
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
                } else {
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
            });
        });
    }

    async isHidingTeam() {
        const gameRepository = await this.roomRepository.getGameRepository();
        const me = await gameRepository.getMe();
        console.log(">>>", this.isHidingTeam());
        return me.isHidingTeam();
    }

    async setIsHidingTeam() {
        const gameRepository = await this.roomRepository.getGameRepository();
        const me = await gameRepository.getMe();
        me.setIsHidingTeam();
    }

    async setDead() {
        const gameRepository = await this.roomRepository.getGameRepository();
        const me = await gameRepository.getMe();
        me.setDead();
    }

    reflectFromWall(direction) {
        this.x -= MyPlayerSprite.moveX[direction] * MyPlayerSprite.PLAYER_SPEED;
        this.y -= MyPlayerSprite.moveY[direction] * MyPlayerSprite.PLAYER_SPEED;
    }

    stopMove(headDir) {
        this.roomRepository.getGameRepository().then((gameRepository) => {
            gameRepository.getMe().then((me) => {
                this.setVelocityX(0);
                this.setVelocityY(0);
                if (me.isRacoonTeam()) {
                    switch (headDir) {
                        case 0:
                            if (this.anims.currentAnim.key != "racoon-idle-up")
                                this.anims.play("racoon-idle-up");
                            break;
                        case 1:
                            if (
                                this.anims.currentAnim.key !=
                                "racoon-idle-right"
                            )
                                this.anims.play("racoon-idle-right");
                            break;
                        case 2:
                            if (
                                this.anims.currentAnim.key != "racoon-idle-down"
                            )
                                this.anims.play("racoon-idle-down");
                            break;
                        case 3:
                            if (
                                this.anims.currentAnim.key != "racoon-idle-left"
                            )
                                this.anims.play("racoon-idle-left");
                            break;
                    }
                } else {
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
            });
        });
    }
    move(direction) {
        this.roomRepository.getGameRepository().then((gameRepository) => {
            gameRepository.getMe().then((me) => {
                if (!this.canMove()) return;
                switch (direction) {
                    case Direction.Up:
                        this.setVelocityY(-1 * MyPlayerSprite.PLAYER_SPEED);
                        this.setVelocityX(0);

                        if (
                            me.isRacoonTeam() &&
                            this.anims.currentAnim.key != "racoon-run-up"
                        )
                            this.anims.play("racoon-run-up");
                        if (
                            !me.isRacoonTeam() &&
                            this.anims.currentAnim.key != "fox-run-up"
                        )
                            this.anims.play("fox-run-up");

                        break;
                    case Direction.Down:
                        this.setVelocityY(MyPlayerSprite.PLAYER_SPEED);
                        this.setVelocityX(0);
                        //this.y += Player.PLAYER_SPEED;
                        if (
                            me.isRacoonTeam() &&
                            this.anims.currentAnim.key != "racoon-run-down"
                        )
                            this.anims.play("racoon-run-down");
                        if (
                            !me.isRacoonTeam() &&
                            this.anims.currentAnim.key != "fox-run-down"
                        )
                            this.anims.play("fox-run-down");

                        break;
                    case Direction.Right:
                        this.setVelocityX(MyPlayerSprite.PLAYER_SPEED);
                        this.setVelocityY(0);
                        //this.x += Player.PLAYER_SPEED;
                        if (
                            me.isRacoonTeam() &&
                            this.anims.currentAnim.key != "racoon-run-right"
                        )
                            this.anims.play("racoon-run-right");
                        if (
                            !me.isRacoonTeam() &&
                            this.anims.currentAnim.key != "fox-run-right"
                        )
                            this.anims.play("fox-run-right");
                        break;
                    case Direction.Left:
                        this.setVelocityX(-1 * MyPlayerSprite.PLAYER_SPEED);
                        this.setVelocityY(0);
                        //this.x -= Player.PLAYER_SPEED;
                        if (
                            me.isRacoonTeam() &&
                            this.anims.currentAnim.key != "racoon-run-left"
                        )
                            this.anims.play("racoon-run-left");
                        if (
                            !me.isRacoonTeam() &&
                            this.anims.currentAnim.key != "fox-run-left"
                        )
                            this.anims.play("fox-run-left");

                        break;
                }
            });
        });
    }

    canMove() {
        return this.#canMove;
    }

    allowMove() {
        this.#canMove = true;
    }

    disallowMove() {
        this.#canMove = false;
    }
}
