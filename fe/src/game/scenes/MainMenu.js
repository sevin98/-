import { Scene } from 'phaser';

export class MainMenu extends Phaser.Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    preload(){
        // 여기서 map에 접근
    }
    create ()
    {

        // 맵 미리보기나 다른 용도로 맵 데이터 사용
        // 예: 미니맵 표시
        // this.createMinimap(map, layers);

        // console.log("mainmenu");
    }
}

export default MainMenu;
