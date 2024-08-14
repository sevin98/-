import Phaser from "phaser";
import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";

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
        this.isReversed = false;

        this.roomRepository = getRoomRepository();
    }

    setReversed(value) {
        this.isReversed = value;
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

    update(footstepSound) {
        // 못움직일때
        if (!this.canMove()) {
            this.freezePlayerMovement();
            if (this.localPlayer.getIsFootstepSoundPlaying()) {
                footstepSound.stop();
            }
            return;
        }

        // 키가 안눌려있을때
        if (
            this.m_cursorKeys.left.isUp &&
            this.m_cursorKeys.right.isUp &&
            this.m_cursorKeys.down.isUp &&
            this.m_cursorKeys.up.isUp
        ) {
            this.moving = 0;
        } else {
            if (!this.isReversed) {
                // 원래 움직임 코드
                if (this.m_cursorKeys.left.isDown) {
                    if (
                        (this.moving == 1 && this.headDir == 3) ||
                        this.moving == 0
                    ) {
                        this.localPlayer.move(Direction.Left);
                        this.headDir = 3;
                        this.moving = 1;
                    }
                }
                if (this.m_cursorKeys.right.isDown) {
                    if (
                        (this.moving == 1 && this.headDir == 1) ||
                        this.moving == 0
                    ) {
                        this.localPlayer.move(Direction.Right);
                        this.headDir = 1;
                        this.moving = 1;
                    }
                }
                if (this.m_cursorKeys.up.isDown) {
                    if (
                        (this.moving == 1 && this.headDir == 0) ||
                        this.moving == 0
                    ) {
                        this.localPlayer.move(Direction.Up);
                        this.headDir = 0;
                        this.moving = 1;
                    }
                }
                if (this.m_cursorKeys.down.isDown) {
                    if (
                        (this.moving == 1 && this.headDir == 2) ||
                        this.moving == 0
                    ) {
                        this.localPlayer.move(Direction.Down);
                        this.headDir = 2;
                        this.moving = 1;
                    }
                }
            } else {
                // 키반전 이벤트
                if (this.m_cursorKeys.left.isDown) {
                    if (
                        (this.moving == 1 && this.headDir == 3) ||
                        this.moving == 0
                    ) {
                        this.localPlayer.move(Direction.Right);
                        this.headDir = 3;
                        this.moving = 1;
                    }
                }
                if (this.m_cursorKeys.right.isDown) {
                    if (
                        (this.moving == 1 && this.headDir == 1) ||
                        this.moving == 0
                    ) {
                        this.localPlayer.move(Direction.Left);
                        this.headDir = 1;
                        this.moving = 1;
                    }
                }
                if (this.m_cursorKeys.up.isDown) {
                    if (
                        (this.moving == 1 && this.headDir == 0) ||
                        this.moving == 0
                    ) {
                        this.localPlayer.move(Direction.Down);
                        this.headDir = 0;
                        this.moving = 1;
                    }
                }
                if (this.m_cursorKeys.down.isDown) {
                    if (
                        (this.moving == 1 && this.headDir == 2) ||
                        this.moving == 0
                    ) {
                        this.localPlayer.move(Direction.Up);
                        this.headDir = 2;
                        this.moving = 1;
                    }
                }
            }
        }

        // 움직임에 따른 소리 코드 분리
        if (
            this.m_cursorKeys.left.isUp &&
            this.m_cursorKeys.right.isUp &&
            this.m_cursorKeys.down.isUp &&
            this.m_cursorKeys.up.isUp
        ) {
            if (this.localPlayer.getIsFootstepSoundPlaying()) {
                footstepSound.stop();
                this.localPlayer.setIsFootstepSoundPlaying(false);
            }
        } else {
            if (!this.localPlayer.getIsFootstepSoundPlaying()) {
                footstepSound.play();
                this.localPlayer.setIsFootstepSoundPlaying(true);
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
            footstepSound.stop();
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

export default class MyPlayerSprite extends Phaser.GameObjects.Container {
    static moveX = [0, 1, 0, -1];
    static moveY = [-1, 0, 1, 0];

    #canMove = true;
    #isFootstepSoundPlaying = false;

    constructor(scene, x, y, texture, nickname) {
        const playerSprite = scene.add
            .sprite(0, 0, texture)
            .setDisplaySize(16, 16);
        const nicknameText = scene.add.text(-20, -20, nickname, {
            fontSize: "10px",
            color: "#ffffff",
        });

        super(scene, x, y, [playerSprite, nicknameText]);
        this.scene = scene;
        this.scene.add.existing(this);

        this.playerSprite = playerSprite;
        this.nicknameText = nicknameText;
        this.PLAYER_SPEED = 200;

        this.scene.physics.world.enable(this);

        this.body.setSize(16, 16);
        this.body.setOffset(-8, -8);

        this.roomRepository = getRoomRepository();

        this.roomRepository.getGameRepository().then((gameRepository) => {
            gameRepository.getMe().then(async (me) => {
                me.setSprite(this);

                if (await me.isRacoonTeam()) {
                    this.playerSprite.anims.create({
                        key: "racoon-idle-down",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "racoon",
                            {
                                start: 1,
                                end: 2,
                                prefix: "idle-down-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 5,
                    });

                    this.playerSprite.anims.create({
                        key: "racoon-idle-right",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "racoon",
                            {
                                start: 1,
                                end: 2,
                                prefix: "idle-right-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 1,
                    });
                    this.playerSprite.anims.create({
                        key: "racoon-idle-left",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "racoon",
                            {
                                start: 1,
                                end: 2,
                                prefix: "idle-left-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 1,
                    });

                    this.playerSprite.anims.create({
                        key: "racoon-idle-up",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "racoon",
                            {
                                start: 1,
                                end: 2,
                                prefix: "idle-up-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 1,
                    });

                    this.playerSprite.anims.create({
                        key: "racoon-run-down",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "racoon",
                            {
                                start: 1,
                                end: 4,
                                prefix: "run-down-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 10,
                    });

                    this.playerSprite.anims.create({
                        key: "racoon-run-up",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "racoon",
                            {
                                start: 1,
                                end: 4,
                                prefix: "run-up-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 10,
                    });

                    this.playerSprite.anims.create({
                        key: "racoon-run-right",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "racoon",
                            {
                                start: 1,
                                end: 4,
                                prefix: "run-right-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 10,
                    });
                    this.playerSprite.anims.create({
                        key: "racoon-run-left",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "racoon",
                            {
                                start: 1,
                                end: 4,
                                prefix: "run-left-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 10,
                    });

                    this.playerSprite.anims.play("racoon-idle-down");
                } else {
                    this.playerSprite.anims.create({
                        key: "fox-idle-down",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "fox",
                            {
                                start: 1,
                                end: 2,
                                prefix: "idle-down-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 5,
                    });

                    this.playerSprite.anims.create({
                        key: "fox-idle-right",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "fox",
                            {
                                start: 1,
                                end: 2,
                                prefix: "idle-right-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 1,
                    });
                    this.playerSprite.anims.create({
                        key: "fox-idle-left",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "fox",
                            {
                                start: 1,
                                end: 2,
                                prefix: "idle-left-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 1,
                    });

                    this.playerSprite.anims.create({
                        key: "fox-idle-up",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "fox",
                            {
                                start: 1,
                                end: 2,
                                prefix: "idle-up-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 1,
                    });

                    this.playerSprite.anims.create({
                        key: "fox-run-down",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "fox",
                            {
                                start: 1,
                                end: 4,
                                prefix: "run-down-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 10,
                    });

                    this.playerSprite.anims.create({
                        key: "fox-run-up",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "fox",
                            {
                                start: 1,
                                end: 4,
                                prefix: "run-up-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 10,
                    });

                    this.playerSprite.anims.create({
                        key: "fox-run-right",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "fox",
                            {
                                start: 1,
                                end: 4,
                                prefix: "run-right-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 10,
                    });
                    this.playerSprite.anims.create({
                        key: "fox-run-left",
                        frames: this.playerSprite.anims.generateFrameNames(
                            "fox",
                            {
                                start: 1,
                                end: 4,
                                prefix: "run-left-",
                                suffix: ".png",
                            }
                        ),
                        repeat: -1,
                        frameRate: 10,
                    });

                    this.playerSprite.anims.play("fox-idle-down");
                }
            });
        });
    }

    update() {
        this.roomRepository.getGameRepository().then((gameRepository) => {
            if (this.PLAYER_SPEED !== 200)
                console.log(gameRepository.getItemSpeed());
            this.PLAYER_SPEED = gameRepository.getItemSpeed();
        });
    }

    async isHidingTeam() {
        const gameRepository = await this.roomRepository.getGameRepository();
        const me = await gameRepository.getMe();
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

    async isDead() {
        const gameRepository = await this.roomRepository.getGameRepository();
        const me = await gameRepository.getMe();
        return me.isDead();
    }

    reflectFromWall(direction) {
        this.x -= MyPlayerSprite.moveX[direction] * this.PLAYER_SPEED;
        this.y -= MyPlayerSprite.moveY[direction] * this.PLAYER_SPEED;
    }

    stopMove(headDir) {
        this.roomRepository.getGameRepository().then((gameRepository) => {
            gameRepository.getMe().then(async (me) => {
                this.body.setVelocityX(0);
                this.body.setVelocityY(0);
                if (await me.isRacoonTeam()) {
                    switch (headDir) {
                        case 0:
                            if (
                                this.playerSprite.anims.currentAnim.key !=
                                "racoon-idle-up"
                            )
                                this.playerSprite.anims.play("racoon-idle-up");
                            break;
                        case 1:
                            if (
                                this.playerSprite.anims.currentAnim.key !=
                                "racoon-idle-right"
                            )
                                this.playerSprite.anims.play(
                                    "racoon-idle-right"
                                );
                            break;
                        case 2:
                            if (
                                this.playerSprite.anims.currentAnim.key !=
                                "racoon-idle-down"
                            )
                                this.playerSprite.anims.play(
                                    "racoon-idle-down"
                                );
                            break;
                        case 3:
                            if (
                                this.playerSprite.anims.currentAnim.key !=
                                "racoon-idle-left"
                            )
                                this.playerSprite.anims.play(
                                    "racoon-idle-left"
                                );
                            break;
                    }
                } else {
                    switch (headDir) {
                        case 0:
                            if (
                                this.playerSprite.anims.currentAnim.key !=
                                "fox-idle-up"
                            )
                                this.playerSprite.anims.play("fox-idle-up");
                            break;
                        case 1:
                            if (
                                this.playerSprite.anims.currentAnim.key !=
                                "fox-idle-right"
                            )
                                this.playerSprite.anims.play("fox-idle-right");
                            break;
                        case 2:
                            if (
                                this.playerSprite.anims.currentAnim.key !=
                                "fox-idle-down"
                            )
                                this.playerSprite.anims.play("fox-idle-down");
                            break;
                        case 3:
                            if (
                                this.playerSprite.anims.currentAnim.key !=
                                "fox-idle-left"
                            )
                                this.playerSprite.anims.play("fox-idle-left");
                            break;
                    }
                }
            });
        });
    }
    move(direction) {
        this.roomRepository.getGameRepository().then((gameRepository) => {
            gameRepository.getMe().then(async (me) => {
                if (!this.canMove()) return;
                switch (direction) {
                    case Direction.Up:
                        this.body.setVelocityY(-1 * this.PLAYER_SPEED);
                        this.body.setVelocityX(0);

                        if (
                            (await me.isRacoonTeam()) &&
                            this.playerSprite.anims.currentAnim.key !=
                                "racoon-run-up"
                        )
                            this.playerSprite.anims.play("racoon-run-up");
                        if (
                            !(await me.isRacoonTeam()) &&
                            this.playerSprite.anims.currentAnim.key !=
                                "fox-run-up"
                        )
                            this.playerSprite.anims.play("fox-run-up");

                        break;
                    case Direction.Down:
                        this.body.setVelocityY(this.PLAYER_SPEED);
                        this.body.setVelocityX(0);
                        if (
                            (await me.isRacoonTeam()) &&
                            this.playerSprite.anims.currentAnim.key !=
                                "racoon-run-down"
                        )
                            this.playerSprite.anims.play("racoon-run-down");
                        if (
                            !(await me.isRacoonTeam()) &&
                            this.playerSprite.anims.currentAnim.key !=
                                "fox-run-down"
                        )
                            this.playerSprite.anims.play("fox-run-down");

                        break;
                    case Direction.Right:
                        this.body.setVelocityX(this.PLAYER_SPEED);
                        this.body.setVelocityY(0);
                        if (
                            (await me.isRacoonTeam()) &&
                            this.playerSprite.anims.currentAnim.key !=
                                "racoon-run-right"
                        )
                            this.playerSprite.anims.play("racoon-run-right");
                        if (
                            !(await me.isRacoonTeam()) &&
                            this.playerSprite.anims.currentAnim.key !=
                                "fox-run-right"
                        )
                            this.playerSprite.anims.play("fox-run-right");
                        break;
                    case Direction.Left:
                        this.body.setVelocityX(-1 * this.PLAYER_SPEED);
                        this.body.setVelocityY(0);
                        if (
                            (await me.isRacoonTeam()) &&
                            this.playerSprite.anims.currentAnim.key !=
                                "racoon-run-left"
                        )
                            this.playerSprite.anims.play("racoon-run-left");
                        if (
                            !(await me.isRacoonTeam()) &&
                            this.playerSprite.anims.currentAnim.key !=
                                "fox-run-left"
                        )
                            this.playerSprite.anims.play("fox-run-left");

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

    setIsFootstepSoundPlaying(isFootstepSoundPlaying) {
        this.#isFootstepSoundPlaying = isFootstepSoundPlaying;
    }

    getIsFootstepSoundPlaying() {
        return this.#isFootstepSoundPlaying;
    }
}
