import Phaser from "phaser";

import Player, { HandlePlayerMove } from "./Player";
import OtherPlayer from "./OtherPlayer";
import MapTile from "./MapTile";
import TextGroup from "./TextGroup";

import { isFirstPress } from "../../util/keyStroke";
import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";

export class game extends Phaser.Scene {
    //cursor = this.cursor.c
    //cursors = Phaser.Input.Keyboard.KeyboardPlugin;
    //fauna = Phaser.Physics.Arcade.Sprite;
    constructor() {
        super("game");
        /// 임의로 포지션 넣은 코드, 이후 삭제
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
        this.load.image("racoon", "assets/character/image.png");
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
        playercam.startFollow(this.localPlayer);

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

        // 다른 플레이어 스프라이트
        this.otherPlayers = [];
        for (let player of this.gameRepository.getAllPlayers()) {
            if (player.getPlayerId() === me.getPlayerId()) {
                continue;
            }

            const otherPlayer = new OtherPlayer(
                this,
                player.getPosition().x,
                player.getPosition().y,
                "fauna-idle-down",
                player.getPlayerId()
            );
            otherPlayer.visible = true;
            this.otherPlayers.push(otherPlayer);
        }

        // playercam.startFollow(this.otherPlayers[0]);

        // //setinteval 대신 addevent 함수씀
        this.time.addEvent({
            delay: 10,
            callback: this.updateAnotherPlayerSpritePosition, // mockingPostion 이라는 함수 만듦
            callbackScope: this, // this를 현재 씬으로 지정
            loop: true, // 여러번 실행
        });

        //game-ui 씬
        this.scene.run("game-ui");
        this.m_cursorKeys = this.input.keyboard.createCursorKeys();
    }

    update() {
        // 로컬플레이어 포지션 트래킹 , 이후 위치는 x,y,headDir로 접근
        const me = this.gameRepository.getMe();
        const { x, y, headDir } = me.getPosition();

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
            x, //this.localPlayer.x,
            y //this.localPlayer.y
        );

        // 시각적으로 가까운 오브젝트와의 선 표시, 나중에 지우면되는코드
        this.graphics.clear().lineStyle(1, 0xff3300).lineBetween(
            closest.body.center.x,
            closest.body.center.y,
            x, //this.localPlayer.x,
            y //this.localPlayer.y
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
        // this.input.keyboard.enabled = false;
        // 상호작용 표시가 있고, space 키 이벤트 있는 경우
        if (
            this.interactionEffect &&
            isFirstPress(
                this.m_cursorKeys.space.keyCode,
                this.m_cursorKeys.space.isDown
            )
        ) {
            //publish
            // console.log(closest.getData("id")); // key:ObjectId
            // key:playerID value: uuid
            const objectId = closest.getData("id");

            // 숨을 차례이면 숨기 요청
            if (this.gameRepository.getMe().isHidingTeam()) {
                // 단, 레디 페이즈에만 숨을 수 있음
                if (this.gameRepository.getCurrentPhase() !== Phase.READY) {
                    console.log("READY 페이즈만 숨을 수 있습니다.");
                } else {
                    this.gameRepository
                        .requestHide(objectId)
                        .then(({ isSucceeded }) => {
                            if (isSucceeded) {
                                console.log("숨기 성공");
                                this.localPlayer.stopMove();
                                this.localPlayer.visible = false; // 화면에 사용자 안보임
                                this.text.showTextHide(
                                    this,
                                    closest.body.x - 20,
                                    closest.body.y - 20
                                );
                                //숨었을때 로컬플레이어 숨음으로 상태 변경
                                // this.getGameRepository.getMe().setIsHiding();
                            }
                        });
                }
            }
            // 찾을 차례면 탐색 요청
            else {
                // 단, 메인 페이즈에만 탐색할 수 있음
                if (this.gameRepository.getCurrentPhase() !== Phase.MAIN) {
                    console.log("MAIN 페이즈에만 탐색할 수 있습니다.");
                }
                // 찾을 수 있는 횟수가 남아 있어야 함
                else if (!this.gameRepository.getMe().canSeek()) {
                    console.log("탐색 횟수가 부족합니다.");
                } else {
                    this.gameRepository
                        .requestSeek(objectId)
                        .then(({ isSucceeded }) => {
                            if (isSucceeded) {
                                console.log("탐색 성공");
                            } else {
                                console.log("탐색 실패");
                            }
                        });
                }
            }
        } else if (
            isFirstPress(
                this.m_cursorKeys.shift.keyCode,
                this.m_cursorKeys.shift.isDown
            )
        ) {
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
            this.gameRepository.getMe().isSeekingTeam() &&
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
    }

    // 맵타일단위를 pix로 변환
    tileToPixel(tileCoord) {
        return tileCoord;
    }

    //constructor에 있는 임의의 position 배열에서 좌표 꺼내는 랜덤함수
    updateAnotherPlayerSpritePosition() {
        for (let otherPlayer of this.otherPlayers) {
            otherPlayer.updatePosition();
            otherPlayer.move(otherPlayer.getHeadDir());
        }
    }
}
