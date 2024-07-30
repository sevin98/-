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
        this.graphics.setDepth(1000); // 항상 제일 위에 그리기
    }
    create() {
        
        const map = this.make.tilemap({
            key: "map-2024-07-29",
        });
       // 첫 번째 타일셋 가져오기
        const tilesetName = map.tilesets[0].name;
    
        // 타일셋 추가
        const tiles = map.addTilesetImage(tilesetName, 'tiles');
    
        // 레이어 생성
        const layers = [];
        for (let i = 0; i < map.layers.length; i++) {
            layers[i] = map.createLayer(i, tiles, 0, 0);
            layers[i].setVisible(true);
        }

         this.cameras.main.setBounds(
             0,
             0,
             map.widthInPixels,
             map.heightInPixels
         );
         this.cameras.main.setScroll(
             map.widthInPixels / 2,
             map.heightInPixels / 2
         );
          const debugGraphics = this.add.graphics().setAlpha(0.7);
          map.renderDebug(debugGraphics, {
              tileColor: null,
              collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
              faceColor: new Phaser.Display.Color(40, 39, 37, 255),
          });

        // const layer1 = map.createLayer("Tile Layer 1", base, 0, 0);


        // const map0 = this.make.tilemap({ key: "map" });
        // const tileset = map0.addTilesetImage("map", "tiles");

        // map0.createLayer("Ground", tileset);
        // const wallsLayer = map0.createLayer("Walls", tileset);

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
