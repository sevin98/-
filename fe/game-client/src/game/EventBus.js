import Phaser from 'phaser'

// Vue 컴포넌트와 Phaser scene 사이에서 이벤트를 발생시키는 데 사용됩니다.
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Events.EventEmitter
export const EventBus = new Phaser.Events.EventEmitter()
