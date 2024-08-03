export class Player {
    #playerId;
    #playerNickname;
    #isReady;
    #isDead;

    constructor({ playerId, playerNickname, isReady }) {
        this.#playerId = playerId;
        this.#playerNickname = playerNickname;
        this.#isReady = isReady;
        this.#isDead = false;
    }

    getPlayerId() {
        return this.#playerId;
    }

    getPlayerNickname() {
        return this.#playerNickname;
    }

    getIsReady() {
        return this.#isReady;
    }

    setIsReady(isReady) {
        this.#isReady = isReady;
    }

    setDead() {
        this.#isDead = true;
    }
}

export class Team {
    // "FOX" || "RACOON"
    #character;
    #isHidingTeam;
    #isSeekingTeam;
    #players = [];

    constructor({ character, isHidingTeam, isSeekingTeam, players }) {
        this.#character = character;
        this.#isHidingTeam = isHidingTeam;
        this.#isSeekingTeam = isSeekingTeam;

        for (const player of players) {
            this.#players.push(new Player(player));
        }
    }

    getCharacter() {
        return this.#character;
    }

    isHidingTeam() {
        return this.#isHidingTeam;
    }

    isSeekingTeam() {
        return this.#isSeekingTeam;
    }

    getPlayers() {
        return this.#players;
    }

    isFoxTeam() {
        return this.#character.toLowerCase() === "fox";
    }

    isRacoonTeam() {
        return this.#character.toLowerCase() === "racoon";
    }
}
