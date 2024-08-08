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

        // map 이미지 로드 
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

        // 화살표 이미지 로드
        this.load.image("DOWN_LEFT", "image/donw_left.png");
        this.load.image("DOWN_RIGHT", "image/down_right.png");
        this.load.image("UP_LEFT", "image/up_left.png");
        this.load.image("UP_RIGHT", "image/up_right.png");
        this.load.image("UP", "image/up.png");
        this.load.image("LEFT", "image/left.png");
        this.load.image("RIGHT", "image/right.png");
        this.load.image("DOWN", "image/down.png");

    }
    create() {
        this.scene.start("game");     
        // this.scene.start("MainMenu");
    }
}
