# Phaser Vue Template

Vue 프레임워크, 그리고 Vite로 번들링되는 Phaser 3 프로젝트 템플릿입니다. Vue와 Phaser 게임 간 통신을 위한 브릿지, 빠른 개발을 위한 hot-reloading, 배포를 위한 스크립트가 포함되어 있습니다.

**[이 템플릿의 Typescript 버전도 있습니다.](https://github.com/phaserjs/template-vue-ts)**

### Versions

이 템플릿은 다음 버전의 프레임워크/도구를 사용합니다:

- [Phaser 3.80.1](https://github.com/phaserjs/phaser)
- [Vue 3.4.27](https://github.com/vuejs)
- [Vite 5.2.11](https://github.com/vitejs/vite)

![screenshot](screenshot.png)

## Requirements

종속성을 설치하고 `npm`으로 스크립트를 실행하기 위해 [Node.js](https://nodejs.org)가 필요합니다.

## Available Commands

| Command         | Description                                    |
| --------------- | ---------------------------------------------- |
| `npm install`   | 프로젝트의 종속성을 설치합니다.                |
| `npm run dev`   | 개발용 웹 서버를 실행합니다.                   |
| `npm run build` | `dist` 폴더에 프로덕션 배포 파일을 생성합니다. |

## Writing Code

레포지토리를 클론한 다음 프로젝트 루트 디렉토리에서 `npm install`을 실행하십시오. 설치가 끝난 다음 `npm run dev`를 실행하여 개발용 로컬 서버를 실행할 수 있습니다.

로컬 개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다. 바꾸시려면 Vite 문서를 참조하거나 SSL 지원을 추가하십시오.

서버가 실행중일 때 `src` 폴더의 파일을 수정하면, Vite가 코드를 자동으로 다시 컴파일하고 브라우저를 새로고침합니다.

## Template Project Structure

빠르게 시작하기 위해 아래와 같이 기본 프로젝트 구조를 제공하고 있습니다:

- `index.html` - 게임을 포함할 기본 HTML 페이지입니다.
- `src` - Vue 소스 코드 모음입니다.
- `src/main.js` - **Vue**의 메인 진입점으로, Vue 애플리케이션을 가동합니다.
- `src/App.vue` - 메인 Vue 컴포넌트입니다.
- `src/game/PhaserGame.vue` - Vue 컴포넌트로, Phaser 게임을 초기화하고 Vue와 Phaser 간 브릿지 역할을 합니다.
- `src/game/EventBus.js` - Vue와 Phaser 간 통신을 위한 간단한 이벤트 버스입니다.
- `src/game` - 게임 소스 코드가 들어있는 폴더입니다.
- `src/game/main.js` - **게임**의 메인 진입점으로, 게임 설정을 포함하고 있으며 게임을 시작합니다.
- `src/game/scenes/` - Phaser Scene이 들어있는 폴더입니다.
- `public/style.css` - 페이지 레이아웃을 만들어주기 위한 간단한 CSS입니다.
- `public/assets` - 게임에서 사용할 정적 에셋이 들어있는 폴더입니다.

## Vue Bridge

`PhaserGame.vue` 컴포넌트는 Vue와 Phaser 사이를 연결합니다. Phaser 게임을 초기화하고, 둘 사이의 이벤트를 전달합니다.

Vue와 Phaser 사이를 연결하기 위해 **EventBus.js** 파일을 사용할 수 있습니다. Vue와 Phaser에서 발생하는 이벤트를 수신하고, 반대로 이벤트를 발생시킬 수 있는 간단한 이벤트 버스(Event bus)입니다.

```js
// In Vue
import { EventBus } from './EventBus'

// Emit an event
EventBus.emit('event-name', data)

// In Phaser
// Listen for an event
EventBus.on('event-name', (data) => {
  // Do something with the data
})
```

나아가 `PhaserGame` 컴포넌트는 Phaser 게임 인스턴스와 가장 최근에 활성화된 Phaser Scene을 노출합니다. 이들은 `(defineExpose({ scene, game }))`를 통해 Vue에서 접근할 수 있습니다.

노출 시켜 놓으면 일반적인 상태 참조처럼 접근할 수 있습니다.

## Phaser Scene Handling

Phaser에서 Scene은 게임의 핵심입니다. 스프라이트를 위치시키고, 게임 로직을 구현하는 등 모든 Phaser 시스템의 기반이 됩니다. 또한 동시에 여러 Scene을 실행할 수 있습니다. 이 템플릿은 Vue에서 현재 활성화된 Scene을 얻는 방법을 제공합니다.

컴포넌트 이벤트 `"current-active-scene"`을 통해 현재 활성화된 Phaser Scene을 얻을 수 있습니다. 이를 위해 Phaser Scene 클래스에서 `"current-scene-ready"` 이벤트를 발생시켜야 합니다. 이 이벤트는 Scene이 사용할 준비가 되었을 때 발생시켜야 합니다. 이는 템플릿의 모든 Scene에서 확인할 수 있습니다.

**중요** : 새로운 Scene을 게임에 추가할 때, 다음과 같이 `EventBus`를 통해 `"current-scene-ready"` 이벤트를 발생시켜 Vue에 노출시켜야 합니다.

```js
class MyScene extends Phaser.Scene {
  constructor() {
    super('MyScene')
  }

  create() {
    // Your Game Objects and logic here

    // At the end of create method:
    EventBus.emit('current-scene-ready', this)
  }
}
```

Vue에서 특정 Scene에 접근하지 않는다면 이벤트를 발생시키지 않아도 됩니다. 또한 꼭 `create` 메서드의 끝에 발생시키지 않아도 됩니다. 예를 들어 Scene이 네트워크 요청이나 API 호출이 완료될 때까지 기다리는 경우, 데이터가 준비되면 이벤트를 발생시킬 수 있습니다.

### Vue Component Example

Vue 컴포넌트에서 Phaser 데이터에 접근하는 예시입니다:

```js
// In a parent component
<script setup>
import { ref, toRaw } from 'vue';

const phaserRef = ref();
const game = toRaw(phaserRef.value.game);
const scene = toRaw(phaserRef.value.scene);

const onCurrentActiveScene = (scene) => {
    // This is invoked
}

</script>
<template>
  <PhaserGame ref="phaserRef" @current-active-scene="onCurrentActiveScene" />
</template>
```

위의 코드에서, `ref()`를 호출하여 현재 Phaser 게임 인스턴스와 현재 Scene에 대한 참조를 얻을 수 있습니다.

이러한 상태 참조를 사용하여 `toRaw(phaserRef.value.game)`을 통해 게임 인스턴스에 접근할 수 있으며, 가장 최근에 활성화된 Scene에는 `toRaw(phaserRef.value.scene)`을 통해 접근할 수 있습니다.

`onCurrentActiveScene` 콜백은 Phaser Scene이 변경될 때마다 호출됩니다. 이는 EventBus를 통해 이벤트를 발생시키는 경우에만 발생합니다.

## Handling Assets

Vite는 JavaScript 모듈 `import` 문을 통해 에셋을 로드하는 것을 지원합니다.

이 템플릿은 임베딩 애셋과 정적 폴더에서 로드하는 것을 지원합니다. 에셋을 임베딩하려면 사용하는 JavaScript 파일의 맨 위에 임포트할 수 있습니다:

```js
import logoImg from './assets/logo.png'
```

오디오 파일과 같은 정적 파일을 로드하려면 `public/assets` 폴더에 넣으십시오. 그런 다음 Phaser의 로더 호출에서 아래와 같이 경로를 사용할 수 있습니다:

```js
preload()
{
  //  This is an example of an imported bundled image.
  //  Remember to import it at the top of this file
  this.load.image('logo', logoImg)

  //  This is an example of loading a static image
  //  from the public/assets folder:
  this.load.image('background', 'assets/bg.png')
}
```

`npm run build` 명령어를 실행하면 모든 정적 에셋이 자동으로 `dist/assets` 폴더로 복사됩니다.

## Deploying to Production

`npm run build` 명령어를 실행하면 프로젝트의 코드가 단일 번들로 묶여 `dist` 폴더에 저장됩니다. 프로젝트에서 임포트한 다른 에셋이나 public 에셋 폴더에 저장된 에셋과 함께 저장됩니다.

게임을 배포하시려면 `dist` 폴더의 모든 내용을 웹 서버에 업로드해야 합니다.

## Customizing the Template

### Vite

빌드를 커스터마이징하려면, CSS나 폰트를 로드하는 플러그인을 추가하는 등의 작업을 할 수 있습니다. 이를 위해 `vite/config.*.mjs` 파일을 수정하거나 새로운 설정 파일을 만들어 `package.json`의 특정 npm 작업을 대상으로 지정할 수 있습니다. 자세한 내용은 [Vite 문서](https://vitejs.dev/)를 참조하십시오.

## Join the Phaser Community!

개발자들이 Phaser로 무엇을 만들었는지 보는 것을 좋아합니다! 이는 우리가 계속 발전하는 동기가 됩니다. 그러니 우리의 커뮤니티에 참여하고 작업물을 자랑해주세요 😄

**Visit:** The [Phaser website](https://phaser.io) and follow on [Phaser Twitter](https://twitter.com/phaser_)<br />
**Play:** Some of the amazing games [#madewithphaser](https://twitter.com/search?q=%23madewithphaser&src=typed_query&f=live)<br />
**Learn:** [API Docs](https://newdocs.phaser.io), [Support Forum](https://phaser.discourse.group/) and [StackOverflow](https://stackoverflow.com/questions/tagged/phaser-framework)<br />
**Discord:** Join us on [Discord](https://discord.gg/phaser)<br />
**Code:** 2000+ [Examples](https://labs.phaser.io)<br />
**Read:** The [Phaser World](https://phaser.io/community/newsletter) Newsletter<br />

Created by [Phaser Studio](mailto:support@phaser.io). Powered by coffee, anime, pixels and love.

The Phaser logo and characters are &copy; 2011 - 2024 Phaser Studio Inc.

All rights reserved.
