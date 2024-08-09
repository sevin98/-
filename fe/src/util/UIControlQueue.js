export class MESSAGE_TYPE {
    static TOP_CENTER_MESSAGE = "TOP_CENTER_MESSAGE";
}

class UIControlQueue {
    #gameUiControlQueue = [];

    hasGameUiControlMessage() {
        return this.#gameUiControlQueue.length > 0;
    }

    getGameUiControlMessage() {
        return this.#gameUiControlQueue.shift();
    }

    addGameUiControlMessage(type, data) {
        this.#gameUiControlQueue.push({
            type,
            data,
        });
    }

    addPhaseChangeMessage(phase, finishAfterMilliSec) {
        this.addGameUiControlMessage(MESSAGE_TYPE.TOP_CENTER_MESSAGE, {
            phase,
            finishAfterMilliSec,
        });
    }
}

export default new UIControlQueue();
