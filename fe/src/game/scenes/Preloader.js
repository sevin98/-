import { Scene } from "phaser";
import Phaser from "phaser";
export class Preloader extends Scene {
    constructor() {
        super("preloader");
    }
    preload() {
        //캐릭터 이미지, 이후 player로 분리할것.
        this.load.atlas(
            "racoon",
            "assets/character/image.png",
            "assets/character/racoon.json"
        );
        this.load.atlas(
            "fox",
            "assets/character/fox.png",
            "assets/character/fox.json"
        );
        // this.load.image("blackSide", "assets/blacksideTemp.png");
        //여기서부터 시작

        this.load.tilemapTiledJSON(
            "map-2024-07-29",
            "/assets/map/map-2024-07-29.json"
        );
        this.load.image("tiles", "/assets/map/map-2024-07-29_tiles.png");
        this.load.image("base", "/assets/map/base.png");


        // 상호작용 확인할 오크통&상호작용 표시 이미지 로드
        this.load.image("oak", "assets/object/oak.png");
        this.load.image(
            "interactionEffect",
            "assets/object/interactionEffect.png"
        );
        this.graphics = this.add.graphics(); //그래픽 객체 생성
        // this.graphics.setDepth(10); // 항상 제일 위에 그리기
    }
    create() {
        this.cameras.main.setBackgroundColor(0xff0000);


       // 첫 번째 타일셋 가져오기
        // 타일셋 추가
          

        // const map0 = this.make.tilemap({ key: "map" });
        // const tileset = map.addTilesetImage("base", "tiles");

        // map.createLayer("Ground", tileset);
        // const wallsLayer = map.createLayer("Walls", tileset);

        // wallsLayer.setCollisionByProperty({ collides: true });

        // const debugGraphics = this.add.graphics.setAlpha(0.7);
        // this.physics.add.existing(debugGraphics);
        // wallsLayer.renderDebug(debugGraphics, {
        //     tileColor: null,
        //     collidingTileColor: new Phaser.Display.Color(243, 243, 48, 255),
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255),
        // });

        this.scene.start("game");
    }
}
