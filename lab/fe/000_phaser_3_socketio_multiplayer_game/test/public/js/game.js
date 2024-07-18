var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    } 
  };
var game = new Phaser.Game(config);
function preload() {
    this.load.image('ship', 'assets/spaceShips_001.png');
    this.load.image('otherPlayer', 'assets/enemyBlack5.png');
  }
  function create() {
    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    
    // 서버로부터 현재 플레이어 목록 수신
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                // 현재 클라이언트의 플레이어 추가
                addPlayer(self, players[id]);
            } else {
                // 다른 플레이어 추가
                addOtherPlayers(self, players[id]);
            }
        });
    });

    // 서버로부터 새 플레이어 추가 알림 수신
    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    // 서버로부터 플레이어가 연결을 끊었다는 알림 수신
    this.socket.on('playerDisconnected', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });
      
    this.socket.on('playerMoved', function (playerInfo) {
        var otherPlayer = self.otherPlayers.getChildren().find(player => player.playerId === playerInfo.playerId);
        if (otherPlayer) {
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            otherPlayer.setRotation(playerInfo.rotation);
        }
    });

    // 방향키 입력 설정
    this.cursors = this.input.keyboard.createCursorKeys();
    
    this.lastEmitTime = 0;
    this.emitInterval = 100;  // 밀리초 단위 (예: 100ms = 0.1초)
}

function update() {
    // this는 Phaser의 Scene 객체입니다. self는 create에서 설정한 값입니다.
    var self = this;

    // 플레이어가 존재하는지 확인
    if (self.ship) {
        // 키보드 입력에 따른 플레이어의 이동 처리
        if (self.cursors.left.isDown) {
            console.log('left');
            self.ship.setVelocityX(-200); // 왼쪽 방향으로 이동
        } else if (self.cursors.right.isDown) {
            console.log('right');
            self.ship.setVelocityX(200); // 오른쪽 방향으로 이동
        } else {
            self.ship.setVelocityX(0); // 이동 중이 아닐 때 속도 0
        }

        if (self.cursors.up.isDown) {
            self.ship.setVelocityY(-200); // 위쪽 방향으로 이동
        } else if (self.cursors.down.isDown) {
            self.ship.setVelocityY(200); // 아래쪽 방향으로 이동
        } else {
            self.ship.setVelocityY(0); // 이동 중이 아닐 때 속도 0
        }

        // 물리 엔진에 따른 회전 처리
        if (self.cursors.left.isDown) {
            self.ship.setAngularVelocity(-200); // 왼쪽 방향으로 회전
        } else if (self.cursors.right.isDown) {
            self.ship.setAngularVelocity(200); // 오른쪽 방향으로 회전
        } else {
            self.ship.setAngularVelocity(0); // 회전 중이 아닐 때 각속도 0
        }

        var x = self.ship.x;
        var y = self.ship.y;
        var r = self.ship.rotation;
        if (self.ship.oldPosition && (x !== self.ship.oldPosition.x || y !== self.ship.oldPosition.y || r !== self.ship.oldPosition.rotation)) {
            self.socket.emit('playerMovement', { x: x, y: y, rotation: r });
        }
        // 이전 위치 저장
        self.ship.oldPosition = {
            x: x,
            y: y,
            rotation: r
        };
    }
    
}

function addPlayer(self, playerInfo) {
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
      self.ship.setTint(0x0000ff);
    } else {
      self.ship.setTint(0xff0000);
    }
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
    self.ship.setCollideWorldBounds(true);
  }
  
function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
      otherPlayer.setTint(0x0000ff);
    } else {
      otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
  }