import Phaser from "phaser";
import { Scene } from "phaser";
import Player, { Direction, HandlePlayerMove } from "./Player";
import MapTile from "./MapTile";

// import webSocketClient from "../network";
// import gameStatus from '../../game_status/index'
import { sceneEvents } from "../../events/EventsCenter";

export class game extends Phaser.Scene {
    //cursor = this.cursor.c
    //cursors = Phaser.Input.Keyboard.KeyboardPlugin;
    //fauna = Phaser.Physics.Arcade.Sprite;
    constructor() {
        super("game");
        this.MapTile = null;
        this.objects = null;
        this.lastSentTime = Date.now();
    }

    preload() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.headDir = 2; //under direction
        this.moving = 0;
        const uuid = sessionStorage.getItem("uuid");
    }
    create() {
        this.graphics = this.add.graphics().setDepth(1000); //선만들기 위한 그래픽
        // MapTile.js에서 만들어놓은 함수로 map 호출해주기
        this.maptile = new MapTile(this);
        this.maptile
            .createMap("map-2024-07-29", "dungeon", "tiles")
            .setupCollisions();

        // playercam 정의, zoomTo: 300ms 동안 1.5배 zoom
        const playercam = this.cameras.main;
        // playercam.zoomTo(1.2,300)

        // 로컬플레이어 객체 생성, 카메라 follow
        this.localPlayer = new Player(this, 800, 800, "fauna-idle-down", true);
        this.localPlayer.IsRacoon = true;
        playercam.startFollow(this.localPlayer);

        //로컬플레이어와 layer의 충돌설정
        this.physics.add.collider(
            this.localPlayer,
            this.maptile.getLayers().BackGround,
            () => {
                console.log("Background!!");
            }
        );
        this.physics.add.collider(
            this.localPlayer,
            this.maptile.getLayers().Walls,
            () => {
                console.log("WAll!!");
            }
        );
        this.physics.add.collider(
            this.localPlayer,
            this.maptile.getLayers().BackGround_Of_Wall
        );
        this.physics.add.collider(
            this.localPlayer,
            this.maptile.getLayers().HP
        );
        // floatinglayer를 player 보다 나중에 호출해서 z-index 구현
        this.maptile.createFloatingMap();

        // group생성, 플레이어와의 충돌속성부여
        this.group = this.physics.add.staticGroup(); // 그룹 초기화

        // maptile에서 오브젝트 어레이 가져옴
        const HPs = this.maptile.createHP();
        HPs.forEach((HP) => {
            // console.log(`HP ID: ${HP.id}, X: ${HP.x}, Y: ${HP.y}`); // HP 객체의 id와 좌표를 출력
            const X = this.tileToPixel(HP.x);
            const Y = this.tileToPixel(HP.y);
            let hpObject = this.group.create(X, Y, "oak");
            hpObject.setSize(16, 16);
            hpObject.setData("id", HP.id);
            hpObject.setAlpha(0); //투명하게
        });
        this.physics.add.collider(this.localPlayer, this.group, () => {
            console.log("숨을수있음");
        });

        //game-ui 씬
        this.scene.run("game-ui");
        //24.07.25 phase check timer
        this.hideTeam = "RACOON";

        this.readyPhaseEvent = "YET";
        this.mainPhaseEvent = "YET";
        this.endPhaseEvent = "YET";
        this.resultPhaseEvent = "YET";

        this.m_cursorKeys = this.input.keyboard.createCursorKeys();
    }

    update() {
        // player.js 에서 player 키조작이벤트 불러옴
        const playerMoveHandler = new HandlePlayerMove(
            this.cursors,
            this.localPlayer,
            this.headDir,
            this.moving
        );
        playerMoveHandler.update();

        // 플레이어에서 물리적으로 가장 가까운 거리 찾는 객체
        const closest = this.physics.closest(
            this.localPlayer,
            this.group.getChildren()
        );

        const minDistance = Phaser.Math.Distance.Between(
            closest.body.center.x,
            closest.body.center.y,
            this.localPlayer.x,
            this.localPlayer.y
        );

        // 시각적으로 가까운 오브젝트와의 선 표시, 나중에 지우면되는코드
        this.graphics
            .clear()
            .lineStyle(1, 0xff3300)
            .lineBetween(
                closest.body.center.x,
                closest.body.center.y,
                this.localPlayer.x,
                this.localPlayer.y
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
        //publish
        // this.input.keyboard.enabled = false;
        // 상호작용 표시가 있고, space 키 이벤트 있는 경우
        if (this.interactionEffect && this.m_cursorKeys.space.isDown) {
            // console.log(closest.getData("id")); // key:ObjectId
            // key:playerID value: uuid
            //subscribe
            // if res.type === "INTERACT_HIDE": 키다운
            playerMoveHandler.freezePlayerMovement(); //움직임0으로바꿈
            console.log("정지");
        } 
        if (this.m_cursorKeys.shift.isDown) {
            console.log("unfreeze");
            //subscribe받은 재시작 좌표로 이동
            // this.localPlayer.x = 100;
            // this.localPlayer.y = 500;
            playerMoveHandler.enablePlayerMovement();
        }


        // if current time - last sent time is greater than 100ms
        if (Date.now() - this.lastSentTime > 100) {
            this.lastSentTime = Date.now();
            // this.sharePlayerPosition();
            this.input.keyboard.enabled = true;
        }

        sceneEvents.emit("player-health-changed", this.localPlayer.mhealth);
    }

    // 맵타일단위를 pix로 변환
    tileToPixel(tileCoord) {
        return tileCoord;
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
        if (this.hideTeam === "RACOON" && this.localPlayer.IsRacoon) {
        } else if (this.hideTeam === "FOX" && !this.localPlayer.IsRacoon) {
        } else {
        }
    }
    readyPhaseEnd() {
        this.readyPhaseEvent = "YET";
    }
    mainPhaseStart() {
        this.initPhase();
        this.mainPhaseEvent = "DURING";
        if (this.hideTeam === "RACOON" && this.localPlayer.IsRacoon) {
        } else if (this.hideTeam === "FOX" && !this.localPlayer.IsRacoon) {
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
    //               x: this.localPlayer.x,
    //               y: this.localPlayer.y,
    //               direction: this.getDirectionOfPlayer()
    //           }
    //       })
    //     })
    //   }
    // }
}
