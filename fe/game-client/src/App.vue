<script setup>
import Phaser from 'phaser';
import { ref, toRaw } from 'vue';
import PhaserGame from './game/PhaserGame.vue';

// 스프라이트는 MainMenu Scene에서만 이동할 수 있습니다.
const canMoveSprite = ref();

// PhaserGame 컴포넌트에 대한 참조 (game 및 scene이 노출됨)
const phaserRef = ref();
const spritePosition = ref({ x: 0, y: 0 });

const changeScene = () => {
    const scene = toRaw(phaserRef.value.scene);
    if (scene) {
        // `MainMenu`, `Game`, `GameOver` Scene에 정의된 changeScene 메서드 호출
        scene.changeScene();
    }
}

const moveSprite = () => {
    const scene = toRaw(phaserRef.value.scene);
    if (scene) {
        // `MainMenu` Scene의 `moveLogo` 메서드 호출 및 스프라이트 위치 캡처
        scene.moveLogo(({ x, y }) => {
            spritePosition.value = { x, y };
        });
    }
}

const addSprite = () => {
    const scene = toRaw(phaserRef.value.scene);

    if (scene) {
        // 랜덤한 위치에 새로운 스프라이트 추가
        const x = Phaser.Math.Between(64, scene.scale.width - 64);
        const y = Phaser.Math.Between(64, scene.scale.height - 64);

        // `add.sprite`는 Phaser GameObjectFactory 메서드이며 Sprite Game Object 인스턴스를 반환하여 이를 기반으로 작업할 수 있습니다.
        const star = scene.add.sprite(x, y, 'star');

        // 여기서는 별 스프라이트를 페이드 인 및 아웃하는 Phaser Tween을 생성합니다.
        // 물론 Phaser Scene 코드 내에서도 수행할 수 있지만, 이것은 Phaser 객체 및 시스템이 Phaser 자체 외부에서 작동할 수 있음을 보여주는 예제일 뿐입니다.
        scene.add.tween({
            targets: star,
            duration: 500 + Math.random() * 1000,
            alpha: 0,
            yoyo: true,
            repeat: -1
        });
    }
}

// 해당 이벤트는 PhaserGame 컴포넌트에서 발생합니다.
const currentScene = (scene) => {
    canMoveSprite.value = (scene.scene.key !== 'MainMenu');
}
</script>

<template>
    <PhaserGame ref="phaserRef" @current-active-scene="currentScene" />
    <div>
        <div>
            <button class="button" @click="changeScene">Change Scene</button>
        </div>
        <div>
            <button :disabled="canMoveSprite" class="button" @click="moveSprite">Toggle Movement</button>
        </div>
        <div class="spritePosition">Sprite Position:
            <pre>{{ spritePosition }}</pre>
        </div>
        <div>
            <button class="button" @click="addSprite">Add New Sprite</button>
        </div>
    </div>
</template>
