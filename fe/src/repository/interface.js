export class Player {
    #playerId;
    #playerNickname;
    #isReady;
    #isDead;
    #restSeekCount; // 남은 찾기 횟수
    #catchCount; // 잡은 횟수
    #character;
    #x;
    #y;
    #direction;
    #team;

    static MAX_SEEK_COUNT = 5;

    constructor({ playerId, playerNickname, isReady }) {
        this.#playerId = playerId;
        this.#playerNickname = playerNickname;
        this.#isReady = isReady;
        this.#isDead = false;
        this.#restSeekCount = 5;
        this.#catchCount = 0;
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

    isInitialized() {
        return (
            this.#x !== undefined &&
            this.#y !== undefined &&
            this.#direction !== undefined
        );
    }

    isHidingTeam() {
        return this.#team.isHidingTeam();
    }

    isSeekingTeam() {
        return this.#team.isSeekingTeam();
    }

    getRestSeekCount() {
        return this.#restSeekCount;
    }

    setRestSeekCount(restSeekCount) {
        this.#restSeekCount = restSeekCount;
    }

    getCatchCount() {
        return this.#catchCount;
    }

    increaseCatchCount() {
        this.#catchCount++;
    }

    canSeek() {
        return this.#restSeekCount > 0;
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

    getPlayerWithId(playerId) {
        return this.#players.find(
            (player) => player.getPlayerId() === playerId
        );
    }
}
