import Phaser from "phaser";
import { Scene } from "phaser";
import Player, { Direction } from "./Player";

// import webSocketClient from "../network";
// import gameStatus from '../../game_status/index'
import { sceneEvents } from "../../events/EventsCenter";

export class game extends Phaser.Scene {
    //cursor = this.cursor.c
    //cursors = Phaser.Input.Keyboard.KeyboardPlugin;
    //fauna = Phaser.Physics.Arcade.Sprite;
    constructor() {
        super("game");
        // Set as current millisecond
        this.lastSentTime = Date.now();
    }

    preload() {
        //this.cursors =
        this.cursors = this.input.keyboard.createCursorKeys();
        this.headDir = 2; //under direction
        this.moving = 0;
    }
    create() {

        //preLoader 파일에 넣으면 안됨
        const map = this.make.tilemap({ key: "map-2024-07-29" });
        // 타일셋이름은 json에있는 걸로 해야함 
        const tileset = map.addTilesetImage("dungeon", "tiles");

        const BackGround = map.createLayer("BackGround", tileset, 0, 0);
        const Ground = map.createLayer("Ground", tileset, 0, 0);
        const BackGround_Of_Wall = map.createLayer("Background-Of-Wall", tileset, 0, 0);
        const Walls = map.createLayer("Walls", tileset, 0, 0);
        const HP = map.createLayer("HP", tileset, 0, 0);
        
        BackGround.setCollisionBetween(1, 100, true, false, BackGround);
        BackGround_Of_Wall.setCollisionBetween(1, 100, true, false, BackGround_Of_Wall);
        Walls.setCollisionBetween(1, 100, true, false, Walls);
        HP.setCollisionBetween(1, 100, true, false, HP);

        this.scene.run("game-ui");
        //24.07.25 phase check timer
        this.hideTeam = "RACOON";
        
        this.readyPhaseEvent = "YET";
        this.mainPhaseEvent = "YET";
        this.endPhaseEvent = "YET";
        this.resultPhaseEvent = "YET";
        
        this.graphics = this.add.graphics(); //그래픽 객체 생성
        this.graphics.setDepth(1000); // 항상 제일 위에 그리기
        
        this.m_cursorKeys = this.input.keyboard.createCursorKeys();
        
        // playercam 정의, 300ms 동안 1.5배 zoom 실행
        const playercam = this.cameras.main;
        playercam.zoomTo(1.2,300)

        // player1 물리 구현, 카메라 follow
        this.m_player = new Player(this, 800, 800, "fauna-idle-down", true);
        this.m_player.IsRacoon = true;
        playercam.startFollow(this.m_player);
        this.physics.add.collider(this.m_player, BackGround, () => {
            console.log("Background!!");
        });
        this.physics.add.collider(this.m_player, Walls, () => {
            console.log("WAll!!");});
        this.physics.add.collider(this.m_player, BackGround_Of_Wall);
        this.physics.add.collider(this.m_player, HP, () => {
            console.log("숨을수 있음")
        });
        
        console.log(HP)
        // object 오크통, player1과 상호작용 구현
        this.group = this.physics.add.group({
            collideWorldBounds: true,
            immovable: true,
        });
        this.group.create(170, 100);
        this.group.create(170, 200);
        this.group.create(100, 200);
        this.group.create(100, 100);

        // HP.forEachTile(tile =>{
        //   console.log(tile)
        // })

        // floatinglayer를 player 보다 나중에 호출해서 z-index 구현 
        const Floatings = map.createLayer("Floatings", tileset, 0, 0);
    }
    
    update() {
        sceneEvents.emit("player-health-changed", this.m_player.mhealth);

        this.handlePlayerMove();

        // if current time - last sent time is greater than 100ms
        if (Date.now() - this.lastSentTime > 100) {
            this.lastSentTime = Date.now();
            // this.sharePlayerPosition();
        }

        if (this.m_cursorKeys.space.isDown) {
            this.m_player.IsRacoon = !this.m_player.IsRacoon;
        }

        // 플레이어에서 물리적으로 가장 가까운 거리 찾는 객체
        const closest = this.physics.closest(
            this.m_player,
            this.group.getChildren()
        );

        const minDistance = Phaser.Math.Distance.Between(
            closest.body.center.x,
            closest.body.center.y,
            this.m_player.x,
            this.m_player.y
        );

        this.graphics
            .clear() // 시각적으로 가까운 오브젝트와의 선 표시
            .lineStyle(1, 0xff3300)
            .lineBetween(
                closest.body.center.x,
                closest.body.center.y,
                this.m_player.x,
                this.m_player.y
            );

        // 30px 이하로 가까이 있을때 상호작용 표시 로직
        if (minDistance < 30) {
            if (!this.interactionEffect) {
                this.interactionEffect = this.add.image(
                    closest.body.center.x,
                    closest.body.center.y - 20,
                    "interactionEffect"
                );
                this.interactionEffect.setScale(0.03);
            } else {
                // 이미 존재하는 경우 위치만 업데이트
                this.interactionEffect.setPosition(
                    closest.body.center.x,
                    closest.body.center.y - 20
                );
            }
        } else {
            // 30픽셀 이상 떨어졌을 때 상호작용 효과 제거
            if (this.interactionEffect) {
                this.interactionEffect.destroy();
                this.interactionEffect = null;
            }
        }
    }

    handlePlayerMove() {
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
                this.m_player.move(Direction.Left);
                this.headDir = 3;
                this.moving = 1;
            }
        }
        if (this.m_cursorKeys.right.isDown) {
            if ((this.moving == 1 && this.headDir == 1) || this.moving == 0) {
                this.m_player.move(Direction.Right);
                this.headDir = 1;
                this.moving = 1;
            }
        }
        if (this.m_cursorKeys.up.isDown) {
            if ((this.moving == 1 && this.headDir == 0) || this.moving == 0) {
                this.m_player.move(Direction.Up);
                this.headDir = 0;
                this.moving = 1;
            }
        }
        if (this.m_cursorKeys.down.isDown) {
            if ((this.moving == 1 && this.headDir == 2) || this.moving == 0) {
                this.m_player.move(Direction.Down);
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
            this.m_player.stopMove(this.headDir);
        }
    }

    initPhase() {
        this.readyPhaseEvent = "YET";
        this.mainPhaseEvent = "YET";
        this.endPhaseEvent = "YET";
        this.resultPhaseEvent = "YET";
    }
    readyPhaseStart() {
        this.initPhase();
        this.readyPhaseEvent = "DURING";
        if (this.hideTeam === "RACOON" && this.m_player.IsRacoon) {
        } else if (this.hideTeam === "FOX" && !this.m_player.IsRacoon) {
        } else {
        }
    }
    readyPhaseEnd() {
        this.readyPhaseEvent = "YET";
    }
    mainPhaseStart() {
        this.initPhase();
        this.mainPhaseEvent = "DURING";
        if (this.hideTeam === "RACOON" && this.m_player.IsRacoon) {
        } else if (this.hideTeam === "FOX" && !this.m_player.IsRacoon) {
        } else {
        }
    }

    // sharePlayerPosition() {
    //   if (webSocketClient.active) {
    //     webSocketClient.publish({
    //       destination: `/ws/rooms/${gameStatus.room.id}/players/position`,
    //       body: JSON.stringify({
    //           requestId: null,
    //           data: {
    //               playerId: gameStatus.player.id,
    //               x: this.m_player.x,
    //               y: this.m_player.y,
    //               direction: this.getDirectionOfPlayer()
    //           }
    //       })
    //     })
    //   }
    // }

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
