import Phaser from "phaser";

export default class TextGroup extends Phaser.GameObjects.Group {
    constructor() {
        super(TextGroup);
        this.styles = {
            style1: { font: "10px Arial", fill: "#ffffff" },
            style2: { font: "18px Arial", fill: "#ff0000" }, // 빨간글씨
            style3: { font: "20px Arial", fill: "#ff0000" },
        };
    }
    // 이후 아이템 배치 불가 추가
    showTextHide(scene, x, y) {
        const text = scene.add.text(x, y, "숨었습니다!", this.styles.style1);
        this.add(text);

        scene.time.addEvent({
            delay: 200,
            callback: () => {
                text.destroy();
            },
        });
    }

    showTextFailHide(scene, x, y) {
        const text = scene.add.text(
            x,
            y,
            "숨을 수 없습니다!",
            this.styles.style1
        );
        this.add(text);

        scene.time.addEvent({
            delay: 200,
            callback: () => {
                text.destroy();
            },
        });
    }
    showTextFind(scene, x, y) {
        //플레이어 화면의 중간에 띄울 예정
        const text = scene.add.text(x, y, "찾았습니다!", this.styles.style2);
        this.add(text);

        scene.time.addEvent({
            delay: 200,
            callback: () => {
                text.destroy();
            },
        });
    }

    showTextFailFind(scene, x, y) {
        // 항상 플레이어 화면의 중간에 띄울예정
        const text = scene.add.text(
            x,
            y,
            "여기 숨은 사람이 없습니다!",
            this.styles.style2
        );
        this.add(text);

        scene.time.addEvent({
            delay: 200,
            callback: () => {
                text.destroy();
            },
        });
    }
    showTextNoAvaiblableCount(scene, x, y) {
        const text = scene.add.text(
            x,
            y,
            "찾을 수 있는 남은 횟수가 없습니다",
            this.styles.style2
        );
        this.add(text);

        scene.time.addEvent({
            delay: 200,
            callback: () => {
                text.destroy();
            },
        });
    }
}
