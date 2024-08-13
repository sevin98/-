import Phaser from "phaser";

import MyPlayerSprite, { HandlePlayerMove } from "./Player";
import OtherPlayerSprite from "./OtherPlayer";
import MapTile from "./MapTile";
import TextGroup from "./TextGroup";

import { isFirstPress } from "../../util/keyStroke";
import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";
import uiControlQueue from "../../util/UIControlQueue";

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

        this.lastWallPos = {};
        this.hintImages = {};
        this.shownHintForCurrentPhase = false;
    }

    preload() {
        this.load.image("racoon", "assets/character/image.png");
        this.load.image("success", "assets/object/success.png");
        this.load.image("failed", "assets/object/failed.png");

        this.cursors = this.input.keyboard.createCursorKeys();
        this.headDir = 2; //under direction
        this.moving = 0;
    }

    create() {
        this.m_cursorKeys = this.input.keyboard.createCursorKeys();

        // 키 입력 이벤트 추가
        this.m_cursorKeys.Q = this.input.keyboard.addKey("Q");
        this.m_cursorKeys.W = this.input.keyboard.addKey("W");

        this.text = new TextGroup(this); // 팝업텍스트 객체

        this.graphics = this.add.graphics().setDepth(1000); //선만들기 위한 그래픽

        // MapTile.js에서 만들어놓은 함수로 map 호출해주기
        this.maptile = new MapTile(this);
        this.maptile
            .createMap("map-2024-07-29", "dungeon", "tiles")
            .setupCollisions();

        // playercam 정의, zoomTo: 300ms 동안 1.5배 zoom
        const playercam = this.cameras.main;
        playercam.zoomTo(3, 300);

        // group생성, 플레이어와의 충돌속성부여
        this.group = this.physics.add.staticGroup(); // 그룹 초기화

        // 로컬플레이어 객체 생성, 카메라 follow
        this.roomRepository.getGameRepository().then((gameRepository) => {
            gameRepository.getMe().then((me) => {
                const { x, y, direction } = me.getPosition();
                this.localPlayer = new MyPlayerSprite(
                    this,
                    x,
                    y,
                    "fauna-idle-down",
                    true
                );
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

                // maptile에서 오브젝트 어레이 가져옴
                const HPs = this.maptile.createHP();
                HPs.forEach((HP) => {
                    const X = this.tileToPixel(HP.x);
                    const Y = this.tileToPixel(HP.y);
                    let hpObject = this.group.create(X, Y, "oak");
                    hpObject.setSize(16, 16);
                    hpObject.setData("id", HP.id);
                    hpObject.setAlpha(0); //투명하게
                });

                this.physics.add.collider(this.localPlayer, this.group);

                // 다른 플레이어 스프라이트
                this.otherPlayerSprites = [];
                for (let player of gameRepository.getAllPlayers()) {
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

                //작아지는 맵은 제일 위에 위치해야함!!
                this.mapWalls = this.physics.add.staticGroup();
                //플레이어와 충돌처리
                this.physics.add.collider(
                    this.localPlayer,
                    this.mapWalls,
                    () => {
                        console.log("작아지는 벽과 충돌");
                    }
                );

                //game-ui 씬
                this.scene.run("game-ui");
                // 이벤트리스너
            });
        });

        this.footstepSound = this.sound.add("footstep-sound", {
            volume: 1,
            loop: true,
        });

        this.hpSeekSuccessSound = this.sound.add("hp-seek-success", {
            volume: 1,
        });

        this.hpSeekFailSound = this.sound.add("hp-seek-fail", {
            volume: 1,
        });
    }

    update() {
        // 로컬플레이어 포지션 트래킹 , 이후 위치는 x,y,headDir로 접근
        this.roomRepository.getGameRepository().then((gameRepository) => {
            gameRepository.getMe().then((me) => {
                const { x, y, headDir } = me.getPosition();
                if (this.hintImages) {
                    for (let direction in this.hintImages) {
                        if (this.hintImages[direction]) {
                            if (direction === "DOWN")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x,
                                    this.localPlayer.y + 20
                                );
                            if (direction === "UP")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x,
                                    this.localPlayer.y - 20,
                                    direction
                                );
                            if (direction === "LEFT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x - 20,
                                    this.localPlayer.y,
                                    direction
                                );
                            if (direction === "RIGHT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x + 20,
                                    this.localPlayer.y,
                                    direction
                                );
                            if (direction === "UP_LEFT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x - 20,
                                    this.localPlayer.y - 20,
                                    direction
                                );
                            if (direction === "UP_RIGHT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x + 20,
                                    this.localPlayer.y - 20,
                                    direction
                                );
                            if (direction === "DOWN_LEFT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x - 20,
                                    this.localPlayer.y + 20,
                                    direction
                                );
                            if (direction === "DOWN_RIGHT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x + 20,
                                    this.localPlayer.y + 20,
                                    direction
                                );
                        }
                    }
                }

                // 숨는 팀인 경우
                if (me.isHidingTeam()) {
                    // 레디 페이즈에
                    if (gameRepository.getCurrentPhase() === Phase.READY) {
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
                        } else {
                        }
                        this.shownHintForCurrentPhase = false;
                    }
                    // 메인 페이즈에
                    else if (gameRepository.getCurrentPhase() === Phase.MAIN) {
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
                    if (gameRepository.getCurrentPhase() === Phase.READY) {
                        // 화면에 보이게 하고 움직임 제한
                        this.localPlayer.visible = true;
                        this.localPlayer.disallowMove();
                        this.shownHintForCurrentPhase = false;
                        this.roomRepository.setDirectionHints();
                    }
                    // 메인 페이즈에
                    else if (gameRepository.getCurrentPhase() === Phase.MAIN) {
                        // 화면에 보이게 하고 움직임 허가
                        this.localPlayer.visible = true;
                        this.localPlayer.allowMove();

                        if (
                            !this.shownHintForCurrentPhase &&
                            this.roomRepository.getDirectionHints().length !== 0
                        ) {
                            const directionHints =
                                this.roomRepository.getDirectionHints();
                            directionHints.forEach((direction) => {
                                if (!this.hintImages[direction]) {
                                    if (direction === "DOWN")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x,
                                                this.localPlayer.y + 20,
                                                direction
                                            );
                                    if (direction === "UP")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x,
                                                this.localPlayer.y - 20,
                                                direction
                                            );
                                    if (direction === "LEFT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x - 20,
                                                this.localPlayer.y,
                                                direction
                                            );
                                    if (direction === "RIGHT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x + 20,
                                                this.localPlayer.y,
                                                direction
                                            );
                                    if (direction === "UP_LEFT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x - 20,
                                                this.localPlayer.y - 20,
                                                direction
                                            );
                                    if (direction === "UP_RIGHT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x + 20,
                                                this.localPlayer.y - 20,
                                                direction
                                            );
                                    if (direction === "DOWN_LEFT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x - 20,
                                                this.localPlayer.y + 20,
                                                direction
                                            );
                                    if (direction === "DOWN_RIGHT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x + 20,
                                                this.localPlayer.y + 20,
                                                direction
                                            );

                                    this.hintImages[direction].setScale(0.04);

                                    // 2.5초 후에 이미지를 제거
                                    this.time.addEvent({
                                        delay: 2500,
                                        callback: () => {
                                            if (this.hintImages[direction]) {
                                                this.hintImages[
                                                    direction
                                                ].destroy();
                                                this.hintImages[direction] =
                                                    null;
                                            }
                                        },
                                        callbackScope: this,
                                    });
                                }
                            });

                            this.shownHintForCurrentPhase = true;
                        }
                    } else {
                    }
                }

                // player.js 에서 player 키조작이벤트 불러옴
                const playerMoveHandler = new HandlePlayerMove(
                    this.cursors,
                    this.localPlayer,
                    this.headDir,
                    this.moving
                );
                playerMoveHandler.update(this.footstepSound);

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

                // 아이템 사용 코드추가: Q눌렀을때
                if (Phaser.Input.Keyboard.JustDown(this.m_cursorKeys.Q)) {
                    if (this.interactionEffect) {
                        // interactionEFFECT있을때 가장 가까운 objectid전달
                        this.useItemQ(closest.getData("id"))
                            .then((speed) => {
                                console.log("찐최종:", speed);
                            })
                            .catch((err) => {
                                console.log("useItem호출에러", err);
                            });
                    } else {
                        // 가까운 이펙트없으면 null 전달
                        this.useItemQ(null).then((speed) => {
                            console.log("찐최종:", speed);
                        });
                    } // W 키 눌렀을때
                } else if (
                    Phaser.Input.Keyboard.JustDown(this.m_cursorKeys.W)
                ) {
                    if (this.interactionEffect) {
                        // interactionEFFECT있을때 가장 가까운 objectid전달
                        this.useItemW(closest.getData("id")).then((data) => {
                            console.log("찐최종:", data);
                        });
                    } else {
                        // 가까운 이펙트없으면 null 전달
                        this.useItemW(null).then((data) => {
                            console.log("찐최종:", data);
                        });
                    }
                }

                // 상호작용 표시가 있고, space 키 이벤트 있는 경우
                if (
                    this.interactionEffect &&
                    isFirstPress(
                        this.m_cursorKeys.space.keyCode,
                        this.m_cursorKeys.space.isDown
                    )
                ) {
                    const objectId = closest.getData("id");

                    // 숨을 차례이면 숨기 요청
                    if (me.isHidingTeam()) {
                        // 단, 레디 페이즈에만 숨을 수 있음
                        if (gameRepository.getCurrentPhase() !== Phase.READY) {
                            console.log("READY 페이즈만 숨을 수 있습니다.");
                        } else {
                            gameRepository
                                .requestHide(objectId)
                                .then(({ isSucceeded }) => {
                                    if (isSucceeded) {
                                        console.log("숨기 성공");
                                        me.setIsHiding(true);
                                        this.text.showTextHide(
                                            this,
                                            closest.body.x - 40,
                                            closest.body.y - 40
                                        );
                                        //숨었을때 로컬플레이어 숨음으로 상태 변경
                                        // this.getGameRepository.getMe().setIsHiding();
                                    } else {
                                        console.log("숨기 실패");
                                        this.text.showTextFailHide(
                                            this,
                                            closest.body.x - 40,
                                            closest.body.y - 40
                                        );
                                    }
                                });
                        }
                    }
                    // 찾을 차례면 탐색 요청
                    else {
                        // 단, 메인 페이즈에만 탐색할 수 있음
                        if (gameRepository.getCurrentPhase() !== Phase.MAIN) {
                            console.log("MAIN 페이즈에만 탐색할 수 있습니다.");
                        }
                        // 찾을 수 있는 횟수가 남아 있어야 함
                        else if (!me.canSeek()) {
                            console.log("탐색 횟수가 부족합니다.");
                            // 찾을 수 있는 남은 횟수가 없습니다 메세지
                            this.text.showTextNoAvaiblableCount(
                                this,
                                closest.body.x - 40,
                                closest.body.y - 40
                            );
                        } else {
                            gameRepository
                                .requestSeek(objectId)
                                .then(({ isSucceeded }) => {
                                    if (isSucceeded) {
                                        console.log("탐색 성공");
                                        this.hpSeekSuccessSound.play();

                                        //찾았습니다 메세지
                                        this.text.showTextFind(
                                            this,
                                            closest.body.x - 40,
                                            closest.body.y - 40
                                        );
                                        // 이미지 넣었다가 사라지기
                                        this.showSuccessImage(
                                            closest.body.x + 10,
                                            closest.body.y + 10
                                        );
                                    } else {
                                        console.log("탐색 실패");
                                        this.hpSeekFailSound.play();

                                        //여기 숨은 사람 없습니다 메세지
                                        this.text.showTextFailFind(
                                            this,
                                            closest.body.x - 40,
                                            closest.body.y - 40
                                        );
                                        // 이미지 넣었다가 사라지기
                                        this.showFailedImage(
                                            closest.body.x + 10,
                                            closest.body.y + 10
                                        );

                                        // 50% 확률로 닭 출현
                                        if (Math.random() < 0.5) {
                                            uiControlQueue.addSurpriseChickenMessage();
                                        }
                                    }
                                });
                        }
                    }
                }
            });
        });
        // 맵축소
        this.createMapWall();
        // Q 아이템 사용 요청시
    }
    // Q아이템 사용요청
    async useItemQ(targetId) {
        this.roomRepository.getGameRepository().then((gameRepository) => {
            const item = gameRepository.getItemQ();
            // 고추일때는 targetId null값으로 변환
            if (item === "RED_PEPPER" || item === "MUSHROOM") {
                targetId = null;
            }
            gameRepository
                .requestItemUse(item, targetId)
                .then(({ isSucceeded }) => {
                    //TODO: _game.js의 함수확인
                    if (isSucceeded) {
                        console.log('리턴값ㅇ');
                    }
                });
        });
    }

    // W아이템 사용요청 / qW 같은템일떄 에러나는것같음
    async useItemW(targetId) {
        this.roomRepository.getGameRepository().then((gameRepository) => {
            const item = gameRepository.getItemW();
            // 고추일때는 targetId null값으로 변환
            if (item === "RED_PEPPER" || item === "MUSHROOM") {
                targetId = null;
            }
            gameRepository
                .requestItemUse(item, targetId)
                .then(({ isSucceeded }) => {
                    //TODO: _game.js의 함수확인
                    if (isSucceeded) {
                        console.log("리턴값ㅇ");
                    }
                });
        });
    }

    // 맵타일단위를 pix로 변환
    tileToPixel(tileCoord) {
        return tileCoord;
    }

    // 맞췄을떄 물체위에 동그라미(success) 이미지 넣는 함수
    showSuccessImage(x, y) {
        const image = this.add.image(x, y, "success");
        image.setDepth(10); //
        // 1초후에 이미지를 페이드 아웃하고 제거
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: image,
                alpha: 0,
                duration: 100, // 페이드아웃 시간
                ease: "Power2", // 천천히 사라지는 애니메이션
                onComplete: () => {
                    image.destroy();
                },
            });
        });
    }
    // 틀렸을때 물체위에 실패(failed) 이미지 넣는 함수
    showFailedImage(x, y) {
        const image = this.add.image(x, y, "failed");
        image.setDepth(10); //
        // 1초후에 이미지를 페이드 아웃하고 제거
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: image,
                alpha: 0,
                duration: 100, // 페이드아웃 시간
                ease: "Power2", // 천천히 사라지는 애니메이션
                onComplete: () => {
                    image.destroy();
                },
            });
        });
    }

    //constructor에 있는 임의의 position 배열에서 좌표 꺼내는 랜덤함수
    updateAnotherPlayerSpritePosition() {
        if (!this.otherPlayerSprites) {
            return;
        }
        for (let otherPlayerSprite of this.otherPlayerSprites) {
            otherPlayerSprite.updatePosition();
            otherPlayerSprite.move(otherPlayerSprite.getHeadDir());
        }
    }

    // 벽 만드는 함수: 시작점과 끝점 받아서 직사각형 모양으로 타일 깔기
    createMapWall() {
        this.roomRepository.getGameRepository().then((gameRepository) => {
            const currentSafeZone = gameRepository.getCurrentSafeZone();
            if (!currentSafeZone) {
                return;
            } // 없으면 리턴

            if (
                this.lastWallPos.x !== currentSafeZone[0] ||
                this.lastWallPos.y !== currentSafeZone[1]
            ) {
                console.log("맵이 줄어듭니다");
                if (this.mapWalls) {
                    this.mapWalls.clear(); // 이전 맵 없애기
                }
                const [startX, startY, endX, endY] = currentSafeZone;
                const tileSize = 32; // 타일의 크기를 고정된 값으로 설정 (예: 32x32 픽셀)

                // 위쪽 벽
                for (let y = 0; y < startY; y += tileSize) {
                    for (let x = 0; x < 1600; x += tileSize) {
                        this.createFogTile(x, y, tileSize);
                    }
                }

                // 아래쪽 벽
                for (let y = endY; y < 1600; y += tileSize) {
                    for (let x = 0; x < 1600; x += tileSize) {
                        this.createFogTile(x, y, tileSize);
                    }
                }

                // 왼쪽 벽
                for (let x = 0; x < startX; x += tileSize) {
                    for (let y = startY; y < endY; y += tileSize) {
                        this.createFogTile(x, y, tileSize);
                    }
                }

                // 오른쪽 벽
                for (let x = endX; x < 1600; x += tileSize) {
                    for (let y = startY; y < endY; y += tileSize) {
                        this.createFogTile(x, y, tileSize);
                    }
                }

                // 현재 맵의 경계를 저장
                this.lastWallPos = {
                    x: startX,
                    y: startY,
                };
            }
        });
    }

    createFogTile(x, y, tileSize) {
        const color = 0xffffff;
        const alpha = 0.4;
        const width = tileSize;
        const height = tileSize;

        const graphics = this.add.graphics();
        graphics.fillStyle(color, alpha);
        graphics.fillRect(0, 0, width, height);

        graphics.generateTexture("fogTile", width, height);

        const fogTile = this.mapWalls
            .create(x, y, "fogTile")
            .setDisplaySize(width, height);

        // 안개 타일 애니메이션 효과
        this.tweens.add({
            targets: fogTile,
            alpha: { from: 0, to: alpha },
            duration: 1000,
            ease: "Linear",
        });
    }
}
