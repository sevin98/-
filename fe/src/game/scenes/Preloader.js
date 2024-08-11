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
        this.load.image("DOWN_LEFT", "assets/object/down_left.png");
        this.load.image("DOWN_RIGHT", "assets/object/down_right.png");
        this.load.image("UP_LEFT", "assets/object/up_left.png");
        this.load.image("UP_RIGHT", "assets/object/up_right.png");
        this.load.image("UP", "assets/object/up.png");
        this.load.image("LEFT", "assets/object/left.png");
        this.load.image("RIGHT", "assets/object/right.png");
        this.load.image("DOWN", "assets/object/down.png");

        // 캐릭터 발자국 소리
        this.load.audio(
            "footstep-sound",
            "sounds/effect/minifantasy/16_human_walk_stone_2.wav"
        );

        // 닭소리
        this.load.audio(
            "surprising-chicken",
            "sounds/effect/custom/surprising-chicken.mp3"
        );

        // 닭 머리
        this.load.image("chicken-head-1", "image/chicken-head-1.png");
    }
    create() {
        this.scene.start("game");
        // this.scene.start("MainMenu");
    }
}
