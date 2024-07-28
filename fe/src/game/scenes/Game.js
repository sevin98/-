import { Scene } from "phaser";
import Phaser from "phaser";
import Player, { Direction } from "./Player";

// import webSocketClient from "../network";
// import gameStatus from '../../game_status/index'
import { sceneEvents} from '../../events/EventsCenter'

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
    this.scene.run('game-ui')
    //24.07.25 phase check timer
    this.hideTeam = "RACOON";
    this.readyPhaseEvent = "YET";
    this.mainPhaseEvent = "YET";
    this.endPhaseEvent = "YET";
    this.resultPhaseEvent = "YET";

    this.graphics = this.add.graphics(); //그래픽 객체 생성
    this.graphics.setDepth(1000); // 항상 제일 위에 그리기

    this.m_cursorKeys = this.input.keyboard.createCursorKeys();

    this.cameras.main.setBackgroundColor(0xff0000);
    const map0 = this.make.tilemap({ key: "dungeon" });
    const tileset = map0.addTilesetImage("dungeon", "tiles");

    map0.createLayer("Ground", tileset);
    const wallsLayer = map0.createLayer("Walls", tileset);

    wallsLayer.setCollisionByProperty({ collides: true });

    const debugGraphics = this.graphics.setAlpha(0.7);
    this.physics.add.existing(debugGraphics);
    wallsLayer.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 243, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    });

    // this.m_player2 = this.physics.add.sprite(450, 250, 'fauna', 'walk-down-3.png');
    //this.m_player3 = this.physics.add.sprite(400, 260, 'fauna', 'walk-down-3.png');

    // player1 물리 구현, 카메라 follow
    this.m_player = new Player(this, 200, 100, "fauna-idle-down", true);
    this.m_player.IsRacoon = true;
    this.cameras.main.startFollow(this.m_player);
    this.physics.add.collider(this.m_player, wallsLayer, () => {
      console.log("WAll!!");
    });

    // object 오크통, player1과 상호작용 구현
    this.group = this.physics.add.group({
      defaultKey: "oak",
      collideWorldBounds: true,
      immovable: true,
    });
    this.group.create(170, 100);
    this.group.create(170, 200);
    this.group.create(100, 200);
    this.group.create(100, 100);

    this.physics.add.collider(this.m_player, this.group, () => {
      console.log("오크통과충돌");
    });
  }

  update() {
    sceneEvents.emit('player-health-changed', this.m_player.mhealth)

    this.handlePlayerMove();

    // if current time - last sent time is greater than 100ms
    if (Date.now() - this.lastSentTime > 100) {
      this.lastSentTime = Date.now();
      // this.sharePlayerPosition();
    }

    if (this.m_cursorKeys.space.isDown){
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
      .lineStyle(2, 0xff3300)
      .lineBetween(closest.body.center.x, closest.body.center.y, this.m_player.x, this.m_player.y);

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
      (this.moving == 1 && this.headDir == 0 && !this.m_cursorKeys.up.isDown) ||
      (this.moving == 1 &&
        this.headDir == 1 &&
        !this.m_cursorKeys.right.isDown) ||
      (this.moving == 1 &&
        this.headDir == 2 &&
        !this.m_cursorKeys.down.isDown) ||
      (this.moving == 1 && this.headDir == 3 && !this.m_cursorKeys.left.isDown)
    ) {
      this.moving = 0;
      this.m_player.stopMove(this.headDir);
    }
  }

  initPhase(){
    this.readyPhaseEvent = "YET";
    this.mainPhaseEvent = "YET";
    this.endPhaseEvent = "YET";
    this.resultPhaseEvent = "YET";
  }
  readyPhaseStart(){
    this.initPhase();
    this.readyPhaseEvent = "DURING";
    if(this.hideTeam === "RACOON" && this.m_player.IsRacoon){

    }
    else if(this.hideTeam === "FOX" && !this.m_player.IsRacoon){

    }
    else{

    }  
  }
  readyPhaseEnd(){
    this.readyPhaseEvent = "YET";
  }
  mainPhaseStart(){
    this.initPhase();
    this.mainPhaseEvent = "DURING";
    if(this.hideTeam === "RACOON" && this.m_player.IsRacoon){

    }
    else if(this.hideTeam === "FOX" && !this.m_player.IsRacoon){

    }
    else{

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
    switch(this.headDir) {
      case 0:
        return 'UP';
      case 1:
        return 'RIGHT';
      case 2:
        return 'DOWN';
      case 3:
        return 'LEFT';
    }
  }
}
