import Phaser from 'phaser'
export default class GameUI extends Phaser.Scene{
    health = Phaser.GameObjects.Group

    constructor(){
        super({ key : 'game-ui'})
    }
    preload(){
        this.load.image("racoonhead", "assets/object/racoonhead.png");
        this.load.image("foxhead", "assets/object/foxhead.png");


    }
    create(){
        //묶음으로 UI 만드는 법.
        this.hearts = this.add.group({
            classType : Phaser.GameObjects.Image
        })
        //key : 사용될 이미지, setXY : 위치 좌표(stepX는 UI 객체간 거리), quantity : UI 갯수
        this.hearts.createMultiple({
            key : 'cattemp',
            setXY : {
                x: 10,
                y: 10,
                stepX : 70
            },
            quantity : 3
        })
        

        this.movingTeam= this.add.group({
            classType : Phaser.GameObjects.Image
        })
        this.movingTeam.createMultiple({
            key : 'racoonhead',
            setXY : {
                x: 100,
                y: 50,
                stepX : 0
            },
            quantity : 1
        })
    }

}