import Phaser from "phaser";

import MyPlayerSprite, { HandlePlayerMove } from "./Player";
import OtherPlayerSprite from "./OtherPlayer";
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

        this.MapTile = null;
        this.objects = null;
        this.lastSentTime = Date.now();

        this.roomRepository = getRoomRepository();
        this.gameRepository = this.roomRepository.getGameRepository();

        this.lastWallPos = {};
    }

    preload() {
        //블록 이미지 로드
        this.load.image("mapWallGolden", "rpgui/img/border-image-golden.png");
        this.load.image(
            "mapWallGoldenBorder",
            "rpgui/img/border-image-golden2.png"
        );
        this.load.image("mapWallBorder", "rpgui/img/border-image.png");
        //
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
        this.localPlayer = new MyPlayerSprite(
            this,
            x,
            y,
            "fauna-idle-down",
            true
        );
        //맵축소확인용
        // this.localPlayer = new MyPlayerSprite(
        //     this,
        //     350,
        //     350,
        //     "fauna-idle-down",
        //     true
        // );
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
        this.otherPlayerSprites = [];
        for (let player of this.gameRepository.getAllPlayers()) {
            if (player.getPlayerId() === me.getPlayerId()) {
                continue;
            }

            const otherPlayerSprite = new OtherPlayerSprite(
                this,
                player.getPosition().x,
                player.getPosition().y,
                "fauna-idle-down",
                player.getPlayerId()
            );
            otherPlayerSprite.visible = true;
            player.setSprite(otherPlayerSprite);
            this.otherPlayerSprites.push(otherPlayerSprite);
        }

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

        //작아지는 맵은 제일 위에 위치해야함!!
        this.mapWalls = this.physics.add.staticGroup();
        //플레이어와 충돌처리
        this.physics.add.collider(this.localPlayer, this.mapWalls, () => {
            console.log("작아지는 벽과 충돌");
        });
    }

    update() {
        // 로컬플레이어 포지션 트래킹 , 이후 위치는 x,y,headDir로 접근
        const me = this.gameRepository.getMe();
        const { x, y, headDir } = me.getPosition();

        // 숨는 팀인 경우
        if (me.isHidingTeam()) {
            // 레디 페이즈에
            if (this.gameRepository.getCurrentPhase() === Phase.READY) {
                // 숨었다고 처리 되었으나 화면에 보이고 있으면
                if (me.isHiding() && this.localPlayer.visible) {
                    // 화면에서 숨기고 움직임 제한
                    this.localPlayer.visible = false;
                    this.localPlayer.disallowMove();
                }
                // 아직 안숨었으면
                else if (!me.isHiding()) {
                    // 화면에 보이게 하고 움직임 허가
                    this.localPlayer.visible = true;
                    this.localPlayer.allowMove();
                }
            }
            // 메인 페이즈에
            else if (this.gameRepository.getCurrentPhase() === Phase.MAIN) {
                // 화면에 안보이게 하고 움직임 제한
                this.localPlayer.visible = false;
                this.localPlayer.disallowMove();
            }
        }
        // 찾는 팀인 경우
        else {
            // 항상 숨어 있지 않은 상태를 보장해주고
            me.setIsHiding(false);
            // 레디 페이즈에
            if (this.gameRepository.getCurrentPhase() === Phase.READY) {
                // 화면에 보이게 하고 움직임 제한
                this.localPlayer.visible = true;
                this.localPlayer.disallowMove();
            }
            // 메인 페이즈에
            else if (this.gameRepository.getCurrentPhase() === Phase.MAIN) {
                // 화면에 보이게 하고 움직임 허가
                this.localPlayer.visible = true;
                this.localPlayer.allowMove();
            }
        }

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
                                this.gameRepository.getMe().setIsHiding(true);
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
        // 맵축소
        this.createMapWall();
    }

    // 맵타일단위를 pix로 변환
    tileToPixel(tileCoord) {
        return tileCoord;
    }

    //constructor에 있는 임의의 position 배열에서 좌표 꺼내는 랜덤함수
    updateAnotherPlayerSpritePosition() {
        for (let otherPlayerSprite of this.otherPlayerSprites) {
            otherPlayerSprite.updatePosition();
            otherPlayerSprite.move(otherPlayerSprite.getHeadDir());
        }
    }

    // 벽 만드는 함수: 시작점과 끝점 받아서 직사각형 모양으로 타일 깔기
    createMapWall() {
        // console.log(this.gameRepository.getCurrentPhase() === Phase.END);
        // END Phase에만 호출되어야 함
        // if (this.gameRepository.getCurrentPhase() === Phase.END) {
        //     console.log('줄어듭니다')
        // const currentSafeZone = [300, 300, 500, 500];
        const currentSafeZone = this.gameRepository.getCurrentSafeZone();
        if (!currentSafeZone) {
            return;
        }

        if (
            this.lastWallPos.x !== currentSafeZone[0] ||
            this.lastWallPos.y !== currentSafeZone[1] ||
            this.lastWallPos.endX !== currentSafeZone[2] ||
            this.lastWallPos.endY !== currentSafeZone[3]
        ) {
            // 이전맵 초기화해주기
            const [startX, startY, endX, endY] = currentSafeZone;
            console.log("Update! :", currentSafeZone, "vs", this.lastWallPos);

            const tileSize = (endX - startX)/5 //나누는 수 숫자만 바꾸면 됨
            // 위쪽 벽
            for (let x = startX; x < endX; x += tileSize) {
                this.createWallTile(x, startY, tileSize);
            }
            // 왼쪽 벽
            for (let y = startY + tileSize; y < endY; y += tileSize) {
                this.createWallTile(startX, y, tileSize);
            
                // 아래쪽 벽
            for (let x = startX+tileSize; x < endX; x += tileSize) {
                this.createWallTile(x, endY-tileSize, tileSize);
            }
            }
            // 오른쪽 벽
            for (let y = startY + tileSize; y < endY; y += tileSize) {
                this.createWallTile(endX-tileSize, y, tileSize);
            }

            // 현재 맵의 경계를 저장
            this.lastWallPos = {
                x: startX,
                y: startY,
                endX: endX,
                endY: endY,
            };
        }
    }
    createWallTile(x, y,tileSize) {
        const color = 0xffffff; // 검은색
        const alpha = 0.01; // 반투명도 (0: 완전 투명, 1: 완전 불투명)
        const width = tileSize;
        const height = tileSize;

        const graphics = this.add.graphics();
        graphics.fillStyle(color, alpha);
        graphics.fillRect(0, 0, width, height);

        graphics.generateTexture("wallTile", width, height); // 텍스쳐 만듦

        this.mapWalls
            .create(x, y, "wallTile") // 타일 만듦
            .setDisplaySize(width, height);
    }
}
