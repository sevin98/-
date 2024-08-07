import { getRoomRepository } from "./index";

export class Player {
    #playerId;
    #playerNickname;
    #team;
    #isBot;
    #isReady;
    #isDead;
    #restSeekCount; // 남은 찾기 횟수
    #catchCount; // 잡은 횟수
    #x;
    #y;
    #direction;
    #sprite;
    #isHiding = false;

    static MAX_SEEK_COUNT = 5;

    constructor({ playerId, playerNickname, isReady, isBot, team }) {
        this.#playerId = playerId;
        this.#playerNickname = playerNickname;
        this.#team = team;
        this.#isBot = isBot;
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

    getIsBot() {
        return this.#isBot;
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

    isRacoonTeam() {
        return this.#team.getCharacter().toLowerCase() === "racoon";
    }

    isFoxTeam() {
        return this.#team.getCharacter().toLowerCase() === "fox";
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

    setSprite(sprite) {
        this.#sprite = sprite;
    }

    getSprite() {
        return this.#sprite;
    }

    setIsHiding(isHiding) {
        this.#isHiding = isHiding;
    }

    isHiding() {
        return this.#isHiding;
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

        const roomRepository = getRoomRepository();
        for (const _player of players) {
            const playerInRoom = roomRepository.getPlayerWithId(
                _player.playerId
            );
            let player;

            // 대기실에 없던 플레이어인 경우 (봇)
            if (!playerInRoom) {
                player = new Player({ ..._player, team: this });
                // 방에 추가
                roomRepository.addPlayer(player);
            } else {
                player = playerInRoom;
            }
            this.#players.push(player);
            player.setTeam(this);
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

    addPlayer(player) {
        player.setTeam(this);
        this.#players.push(player);
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
