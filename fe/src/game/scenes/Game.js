import Phaser from "phaser";

import { Scene } from "phaser";
import Player, { Direction, HandlePlayerMove } from "./Player";
import OtherPlayer from "./OtherPlayer"
import MapTile from "./MapTile";
import TextGroup from "./TextGroup";
import { getRoomRepository } from "../../repository";


export class game extends Phaser.Scene {
    //cursor = this.cursor.c
    //cursors = Phaser.Input.Keyboard.KeyboardPlugin;
    //fauna = Phaser.Physics.Arcade.Sprite;
    constructor() {
        super("game");
        /// 임의로 포지션 넣은 코드
        this.positions = [
            [500, 400],
            [500, 390],
            [500, 380],
            [500, 370],
            [500, 360],
            [500, 350],
        ];


        this.MapTile = null;
        this.objects = null;
        this.lastSentTime = Date.now();

        this.roomRepository = getRoomRepository();
        this.gameRepository = this.roomRepository.getGameRepository();
    }

    preload() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.headDir = 2; //under direction
        this.moving = 0;
    }

    create() {
        this.text = new TextGroup(this); // 팝업텍스트 객체

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
        const me = this.gameRepository.getMe();
        const { x, y, direction } = me.getPosition();
        this.localPlayer = new Player(this, x, y, "fauna-idle-down", true);
        this.localPlayer.isRacoon = true;
        // 잠깐 주석처리하고 카메라가 otherplayer를 따라가도록 바꿔놓음 
        // playercam.startFollow(this.localPlayer);

        //로컬플레이어와 layer의 충돌설정
        this.physics.add.collider(
            this.localPlayer,
            this.maptile.getLayers().BackGround
        );
        this.physics.add.collider(
            this.localPlayer,
            this.maptile.getLayers().Walls
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

        // 다른 플레이어 화면 구현
        this.otherPlayer = new OtherPlayer(
            this,
            500,
            500,
            "fauna-idle-down",
            1 // 임의의 id
        );
        //setinteval 대신 addevent 함수씀
        this.time.addEvent({
            delay: 500,
            //500마다 mockingPosition함수 실행
            callback: this.mockingPosition, // mockingPostion 이라는 함수 만듦
            callbackScope: this, // this를 현재 씬으로 지정
            loop: true, // 여러번 실행
        });
        // camera가 otherplayer 따라가게만듦
        this.cameras.main.startFollow(this.otherPlayer);

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

        // 숨기&찾기가 phase에 따라서,
        // 본인 팀(localPlayer의 isHiding)에 따라서도 구분되어야함
        // 숨는팀, 상호작용 표시 있음, space 키 이벤트
        if (
            this.localPlayer.IsHidingTeam &&
            this.interactionEffect &&
            this.m_cursorKeys.space.isDown
        ) {

            console.log("정지");
            this.localPlayer.stopMove();
            this.localPlayer.visible = false; // 화면에 사용자 안보임
            this.text.showTextHide(
                this,
                closest.body.x - 20,
                closest.body.y - 20
            );
            this.localPlayer.setIsHiding(); // IsHIding 상태 바뀜
            // 숨을수 없을때:
            // else{this.text.showTextFailHide(this, closest.body.x - 20, closest.body.y - 20);}
        } else {
            this.localPlayer.move();
        }

        //숨는팀phase 재시작 
        if (this.m_cursorKeys.shift.isDown) {
            //재시작 좌표로 이동
            // this.localPlayer.x = 500;
            // this.localPlayer.y = 400;
            this.localPlayer.visible = true; // 화면에 사용자 보임
            this.text.showTextFailHide(
                this,
                closest.body.x - 20,
                closest.body.y - 20
            );
            // console.log("unfreeze");
        }

        //탐색- 찾는팀,상호작용이펙트,스페이스다운
        if (
            !this.localPlayer.IsHidingTeam &&
            this.interactionEffect &&
            this.m_cursorKeys.space.isDown
        ) {
            this.text.showTextFind(
                this,
                closest.body.x - 20,
                closest.body.y - 20
            );

            // else if 숨은 사람이 없음
            this.text.showTextFailFind(
                this,
                closest.body.x - 20,
                closest.body.y - 20
            );
            // els if type: 더이상 찾을 수 있는 횟수가 없음
            this.text.showTextNoAvaiblableCount(
                this,
                closest.body.x - 20,
                closest.body.y - 20
            );
        }

        //상우 코드
        if (Date.now() - this.lastSentTime > 100) {
            // if current time - last sent time is greater than 100ms
            this.lastSentTime = Date.now();
            // this.sharePlayerPosition();
            this.input.keyboard.enabled = true;
        }
    }

    // 맵타일단위를 pix로 변환
    tileToPixel(tileCoord) {
        return tileCoord;
    }

    //isHidingTeam (interface.js)에서 가끔 에러나요 이유를 못찾음ㅠ 
    //constructor에 있는 임의의 position 배열에서 좌표 꺼내는 랜덤함수
    mockingPosition(){
        this.currentPos = this.positions[Math.floor(Math.random() * this.positions.length)];
        //headDir보이기
        this.headDir = Math.floor(Math.random() * 4);
        // otherPlayer의 포지션 변경
        this.otherPlayer.x = this.currentPos[0];
        this.otherPlayer.y = this.currentPos[1];
        this.otherPlayer.move(this.headDir);
    }



    // 상우 코드
    initPhase() {
        this.readyPhaseEvent = "YET";
        this.mainPhaseEvent = "YET";
        this.endPhaseEvent = "YET";
        this.resultPhaseEvent = "YET";
    }
    readyPhaseStart() {
        this.initPhase();
        this.readyPhaseEvent = "DURING";
        if (this.hideTeam === "RACOON" && this.localPlayer.isRacoon) {
        } else if (this.hideTeam === "FOX" && !this.localPlayer.isRacoon) {
        } else {
        }
    }
    readyPhaseEnd() {
        this.readyPhaseEvent = "YET";
    }
    mainPhaseStart() {
        this.initPhase();
        this.mainPhaseEvent = "DURING";
        if (this.hideTeam === "RACOON" && this.localPlayer.isRacoon) {
        } else if (this.hideTeam === "FOX" && !this.localPlayer.isRacoon) {
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