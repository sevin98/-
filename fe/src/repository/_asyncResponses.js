class AsyncResponses {
    #responses = {};

    set(requestId, result) {
        this.#responses[requestId] = result;
    }

    async get(key) {
        return new Promise((resolve) => {
            const awaiter = setInterval(() => {
                if (this.#responses[key]) {
                    // 반복 중지
                    clearInterval(awaiter);
                    // 데이터 반환
                    const data = this.#responses[key];
                    // 데이터 삭제
                    this.remove(key);

                    return resolve(data);
                }
            }, 50);
        });
    }

    remove(key) {
        delete this.#responses[key];
    }
}

export default new AsyncResponses();
