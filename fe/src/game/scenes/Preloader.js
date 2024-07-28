import { Scene } from 'phaser';

export class Preloader extends Phaser.Scene
{
    constructor ()
    {
        super('preloader');
    }
    preload(){
        this.load.image('tiles', 'assets/dungeon_tiles.png');
        this.load.tilemapTiledJSON('dungeon', 'assets/dungeon-03.json');
        this.load.image('cattemp', 'assets/cat.png');

        this.load.image('foxhead', 'assets/object/foxhead.png');
        this.load.image('racoonhead', 'assets/object/racoonhead.png');

        this.load.image('uitemp', 'assets/ui.png');
        this.load.image('blackSide', 'assets/blacksideTemp.png');
        this.load.atlas('fauna', 'assets/character/fauna.png', 'assets/character/fauna.json');
        this.load.atlas('racoon', 'assets/character/image.png', 'assets/character/racoon.json');
        this.load.atlas('fox', 'assets/character/fox.png', 'assets/character/fox.json');
        this.load.atlas('icon', 'assets/object/icon.png', 'assets/object/icon.json');
        //tilemap = this.load.tilemapTiledJSON('dungeon', 'assets/dungeon-03.json');

        // 상호작용 확인할 오크통&상호작용 표시 이미지 로드
        this.load.image('oak','assets/object/oak.png')
        this.load.image('interactionEffect','assets/object/interactionEffect.png')
    }
    create ()
    {

        this.scene.start('game');
    }
}