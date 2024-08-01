import { Scene } from 'phaser';
import Phaser from 'phaser'

// import webSocketClient from '../network/index'

//키인식
export const Direction = Object.freeze({
    Up: 'Up',
    Down : 'Down',
    Left : 'Left',
    Right : 'Right'
});
export default class Player extends Phaser.Physics.Arcade.Sprite
{
    static PLAYER_SPEED = 200;
    static moveX = [0,1,0,-1];
    static moveY = [-1,0,1,0];
    static mhealth = 3

    get health(){
      return this.mhealth
    }
    //static IsRacoon = true;
    constructor(scene, x, y, texture){
        super(scene, x, y, texture);

        this.scale = 1;
        this.alpha = 1;
        //if(!racoon) this.IsRacoon = false;

        scene.add.existing(this);
        scene.physics.add.existing(this);
      //   this.body.setSize(this.width * 0.1, this.height * 0.1);
        // 스프라이트의 표시 크기를 1px * 1px로 설정
        this.setDisplaySize(16, 16);

        // 물리 바디의 크기를 1px * 1px로 설정
        this.body.setSize(28, 28);

        //racoon animation
        if (true /*this.IsRacoon*/) {
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
        }
        if (true /*!this.IsRacoon*/) {
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
    }
    reflectFromWall(direction){
        this.x -= Player.moveX[direction] * Player.PLAYER_SPEED;
        this.y -= Player.moveY[direction] * Player.PLAYER_SPEED;
    }

    stopMove(headDir){
      --this.mhealth;
      if(this.mhealth<=0){
         // TODO : die

      }
        this.setVelocityX(0);
        this.setVelocityY(0);
        if(this.IsRacoon){
        switch(headDir){
            case 0 :
                if(this.anims.currentAnim.key != 'racoon-idle-up') this.anims.play('racoon-idle-up');
               break;
            case 1 :
                if(this.anims.currentAnim.key != 'racoon-idle-right') this.anims.play('racoon-idle-right');
               break;
            case 2 :
                if(this.anims.currentAnim.key != 'racoon-idle-down') this.anims.play('racoon-idle-down');
               break;
            case 3 :
                if(this.anims.currentAnim.key != 'racoon-idle-left') this.anims.play('racoon-idle-left');
               break;
         }
        }
        else if(!this.IsRacoon){
            switch(headDir){
                case 0 :
                    if(this.anims.currentAnim.key != 'fox-idle-up') this.anims.play('fox-idle-up');
                   break;
                case 1 :
                    if(this.anims.currentAnim.key != 'fox-idle-right') this.anims.play('fox-idle-right');
                   break;
                case 2 :
                    if(this.anims.currentAnim.key != 'fox-idle-down') this.anims.play('fox-idle-down');
                   break;
                case 3 :
                    if(this.anims.currentAnim.key != 'fox-idle-left') this.anims.play('fox-idle-left');
                   break;
             }
            }
    }
    move(direction){

        switch(direction){
            case Direction.Up:
                //this.setVelocityX(-30);
                this.setVelocityY(-1*Player.PLAYER_SPEED);
                this.setVelocityX(0);
                //this.y -= Player.PLAYER_SPEED;
                
                if(this.IsRacoon && this.anims.currentAnim.key != 'racoon-run-up') this.anims.play('racoon-run-up');
                if(!this.IsRacoon && this.anims.currentAnim.key != 'fox-run-up') this.anims.play('fox-run-up');

                break;
            case Direction.Down:
                this.setVelocityY(Player.PLAYER_SPEED);
                this.setVelocityX(0);
                //this.y += Player.PLAYER_SPEED;
                if(this.IsRacoon && this.anims.currentAnim.key != 'racoon-run-down') this.anims.play('racoon-run-down');
                if(!this.IsRacoon && this.anims.currentAnim.key != 'fox-run-down') this.anims.play('fox-run-down');

                break;
            case Direction.Right:
                this.setVelocityX(Player.PLAYER_SPEED);
                this.setVelocityY(0);
                //this.x += Player.PLAYER_SPEED;
                if(this.IsRacoon && this.anims.currentAnim.key != 'racoon-run-right') this.anims.play('racoon-run-right');
                if(!this.IsRacoon && this.anims.currentAnim.key != 'fox-run-right') this.anims.play('fox-run-right');
                break;
            case Direction.Left:
                this.setVelocityX(-1*Player.PLAYER_SPEED);
                this.setVelocityY(0);
                //this.x -= Player.PLAYER_SPEED;
                if(this.IsRacoon && this.anims.currentAnim.key != 'racoon-run-left') this.anims.play('racoon-run-left');
                if(!this.IsRacoon && this.anims.currentAnim.key != 'fox-run-left') this.anims.play('fox-run-left');

                break;    
        }
    }
}