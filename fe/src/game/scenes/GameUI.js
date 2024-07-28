import Phaser from 'phaser'
import {sceneEvents} from '../../events/EventsCenter'
export default class GameUI extends Phaser.Scene{
    health = Phaser.GameObjects.Group

    constructor(){
        super({ key : 'game-ui'})
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
        
        /* 아래는 event 발생(이벤트 키, 이벤트 발생시 동작하는 함수, 반영 대상)과
        없애는 
        sceneEvents.on('player-health-changed', this.handlePlayerHealthChanged , this)
        this.events.on(Phaser.Scenes.Events.SHUTDOWN,()=>{
            sceneEvents.off('player-health-changed', this.handlePlayerHealthChanged , this);
        })
            */

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
    handlePlayerHealthChanged(){
        //UI 그룹 내 객체들 돌면서 진행
        this.hearts.children.each( (go, idx)=>{
                if(idx===0){
                    go.setTexture("uitemp");
                }
            }
        )
    }
}