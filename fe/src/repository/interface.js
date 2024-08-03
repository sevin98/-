export class Player {
    #playerId;
    #playerNickname;
    #isReady;
    #isDead;
    #character;
    #x;
    #y;
    #direction;
    #team;

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

    setCharacter(character) {
        this.#character = character;
    }

    isRacoonTeam() {
        return this.#character.toLowerCase() === "racoon";
    }

    isFoxTeam() {
        return this.#character.toLowerCase() === "fox";
    }

    setPosition({ x, y, direction }) {
        this.#x = x;
        this.#y = y;
        this.#direction = direction;
    }

    getPosition() {
        return { x: this.#x, y: this.#y, direction: this.#direction };
    }

    setTeam(team) {
        this.#team = team;
    }

    getTeam() {
        return this.#team;
    }

    isHidingTeam() {
        return this.#team.isHidingTeam();
    }

    isSeekingTeam() {
        return this.#team.isSeekingTeam();
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

    setIsHidingTeam(isHidingTeam) {
        this.#isHidingTeam = isHidingTeam;
        this.#isSeekingTeam = !isHidingTeam;
    }

    isSeekingTeam() {
        return this.#isSeekingTeam;
    }

    setIsSeekingTeam(isSeekingTeam) {
        this.#isSeekingTeam = isSeekingTeam;
        this.#isHidingTeam = !isSeekingTeam;
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

