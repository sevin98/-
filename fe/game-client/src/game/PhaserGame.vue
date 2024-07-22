<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { EventBus } from './EventBus';
import StartGame from './main';

// 현재 보여지는 화면을 가리키는 변수
const scene = ref();
const game = ref();

// 이벤트 정의
const emit = defineEmits(['current-active-scene']);

// 요소가 로드되면 이벤트 등록
onMounted(() => {
    // 게임 매니저 객체를 가리키도록 하고
    game.value = StartGame('game-container');

    // 현재 화면이 준비되면 씬을 최신화하는 이벤트를 발생시킨다.
    EventBus.on('current-scene-ready', (currentScene) => {
        // 활성화된 씬을 업데이트
        emit('current-active-scene', currentScene);
        scene.value = currentScene;
    });
});

// 요소가 언로드되면 게임에서 사용한 자원을 정리한다.
onUnmounted(() => {
    if (game.value) {
        game.value.destroy(true);
        game.value = null;
    }
});

// 부모 컴포넌트가 자식 컴포넌트에 직접적으로 접근할 수 있도록 노출
// 각각 가장 최근에 활성화된 scene과 전역 게임 객체
defineExpose({ scene, game });
</script>

<template>
    <div id="game-container"></div>
</template>