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

        //로딩중 텍스트메세지
        this.loadingText = this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "LOADING...",
                {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: "36px",
                    fill: "#000",
                    align: "center",
                    stroke: "#fff",
                    strokeThickness: 4,
                }
            )
            .setOrigin(0.5, 0.5);

        // 로딩 화면 배경색
        this.cameras.main.setBackgroundColor("#028af8");
        // HP 탐색 성공
        this.load.audio(
            "hp-seek-success",
            "sounds/effect/etc/hp-seek-success.mp3"
        );

        // HP 탐색 실패
        this.load.audio("hp-seek-fail", "sounds/effect/etc/hp-seek-fail.wav");

        // 남은 시간 타이머
        this.load.image("timer-background", "assets/ui/timer.png");

        // 좁혀지는 벽 이미지
        this.load.image("fog-image", "assets/effect/fog.png");

        // 고추 아이템 적용 효과
        this.load.spritesheet({
            key: "dynamic-pepper-effect",
            url: "assets/effect/Fire+Sparks-Sheet.png",
            frameConfig: {
                frameWidth: 96,
                frameHeight: 96,
                startFrame: 0,
                endFrame: 18,
            },
        });

        this.load.audio(
            "pepper-effect-sound",
            "sounds/effect/etc/pepper-effect.mp3"
        );

        // 방향 버섯 아이템 적용 효과
        this.load.spritesheet({
            key: "dynamic-mushroom-effect",
            url: "assets/effect/S001_nyknck.png",
            frameConfig: {
                frameWidth: 32,
                frameHeight: 32,
                startFrame: 0,
                endFrame: 3,
            },
        });
    }

    create() {
        this.scene.start("game");

        this.anims.create({
            key: "dynamic-pepper-effect-animation",
            frames: this.anims.generateFrameNumbers("dynamic-pepper-effect", {
                start: 0,
                end: 18,
            }),
            frameRate: 20,
            repeat: -1,
        });

        this.anims.create({
            key: "dynamic-mushroom-effect-animation",
            frames: this.anims.generateFrameNumbers("dynamic-mushroom-effect", {
                start: 0,
                end: 3,
            }),
            frameRate: 5,
            repeat: -1,
        });
    }
}
