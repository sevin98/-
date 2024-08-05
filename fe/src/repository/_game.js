import { v4 as uuid } from "uuid";

import { getStompClient } from "../network/StompClient";
import { Team, Player } from "./interface";
import asyncResponses from "./_asyncResponses";
import { Mutex } from "async-mutex";

// 게임 시작 이벤트
const GAME_START = "GAME_START";
// 게임 정보 전달 이벤트
const GAME_INFO = "GAME_INFO";
// 라운드 전환 이벤트
const ROUND_CHANGE = "ROUND_CHANGE";
// 페이즈 전환 이벤트
const PHASE_CHANGE = "PHASE_CHANGE";
// 숨기 성공 이벤트
const INTERACT_HIDE_SUCCESS = "INTERACT_HIDE_SUCCESS";
// 숨기 실패 이벤트
const INTERACT_HIDE_FAIL = "INTERACT_HIDE_FAIL";
// 찾기 성공 이벤트
const INTERACT_SEEK_SUCCESS = "INTERACT_SEEK_SUCCESS";
// 찾기 실패 이벤트
const INTERACT_SEEK_FAIL = "INTERACT_SEEK_FAIL";

// 화면 가리기 명령 이벤트
const COVER_SCREEN = "COVER_SCREEN";
// 화면 가리기 해제 명령 이벤트
const UNCOVER_SCREEN = "UNCOVER_SCREEN";
// 위치 공유 이벤트
const SHARE_POSITION = "SHARE_POSITION";
// 플레이어 조작 불가 명령 이벤트
const FREEZE = "FREEZE";
// 플레이어 조작 불가 해제 명령 이벤트
const UNFREEZE = "UNFREEZE";

// 게임 상태의 초기화를 보장하기 위한 뮤텍스
const gameInitializationMutex = new Mutex();

export class Phase {
    // 게임을 초기화 하고 있는 상태
    static INITIALIZING = "INITIALIZING";
    // 초기화가 완료된 상태
    static INITIALIZED = "INITIALIZED";
    // 숨는 팀이 숨을 곳을 찾고 있는 상태
    static READY = "READY";
    // 찾는 팀이 숨은 팀을 찾고 있는 상태
    static MAIN = "MAIN";
    // 다음 라운드를 위해 기존의 게임 상태를 정리하고 있는 상태
    static END = "END";
    // 게임이 끝난 상태
    static FINISHED = "FINISHED";
}

export default class GameRepository {
    #room;
    #roomNumber;
    #stompClient;
    #startedAt;
    #currentPhase;
    #foxTeam;
    #racoonTeam;
    #me;

    #isInitialized = false;

    constructor(room, roomNumber, gameSubscriptionInfo, startsAfterMilliSec) {
        this.#room = room;
        this.#roomNumber = roomNumber;

        const initializationTrial = setInterval(() => {
            getStompClient()
                .then((client) => {
                    clearInterval(initializationTrial);
                    this.#stompClient = client;
                    this.startSubscribeGame(gameSubscriptionInfo);
                })
                .catch((e) => {});
        }, 100);
    }

    startSubscribeGame(gameSubscriptionInfo) {
        this.#stompClient.subscribe(
            gameSubscriptionInfo,
            async (stompMessage) => {
                const message = JSON.parse(stompMessage.body);
                this.#handleGameMessage(message);
            }
        );
    }

    async #handleGameMessage(message) {
        const { type, data } = message;

        if (!this.#isInitialized && type !== GAME_INFO) {
            await gameInitializationMutex.acquire();
        }

        switch (type) {
            case GAME_START:
                this.#handleGameStartEvent(data);
                break;
            case GAME_INFO:
                this.#handleGameInfoEvent(data);
                this.#isInitialized = true;
                gameInitializationMutex.release();
                break;
            case ROUND_CHANGE:
                this.#handleRoundChangeEvent(data);
                break;
            case PHASE_CHANGE:
                this.#handlePhaseChangeEvent(data);
                break;
            case INTERACT_HIDE_SUCCESS:
                this.#handleInteractHideSuccessEvent(data);
                break;
            case INTERACT_HIDE_FAIL:
                this.#handleInteractHideFailEvent(data);
                break;
            case INTERACT_SEEK_SUCCESS:
                this.#handleInteractSeekSuccessEvent(data);
                break;
            case INTERACT_SEEK_FAIL:
                this.#handleInteractSeekFailEvent(data);
                break;
            default:
                throw new Error(
                    "Unknown message type in GameRepository:" + type
                );
        }
    }

    #handleGameStartEvent() {
        console.log(`게임 시작`);
        this.#startedAt = new Date();
    }

    #handleGameInfoEvent(data) {
        // 페이즈 정보 초기화 (INITIALIZED)
        this.#currentPhase = data.currentPhase;
        // 팀 정보 초기화
        this.#foxTeam = new Team(data.foxTeam);
        this.#racoonTeam = new Team(data.racoonTeam);
    }

    #handleRoundChangeEvent(data) {
        console.log(`라운드 변경: ${data.nextRound}/${data.totalRound}`);
    }

    #handlePhaseChangeEvent(data) {
        console.log(
            `페이즈 변경: ${data.phase}, ${data.finishAfterMilliSec}ms 후 종료`
        );

        // 한 라운드가 끝나면 역할 반전
        this.#currentPhase = data.phase;
        if (this.#currentPhase === Phase.READY) {
            console.log(
                `당신의 팀이 ${
                    this.getMe().isHidingTeam() ? "숨을" : "찾을"
                } 차례입니다.`
            );
        } else if (this.#currentPhase === Phase.END) {
            // 역할 전환
            this.#racoonTeam.setIsHidingTeam(!this.#racoonTeam.isHidingTeam());
            this.#foxTeam.setIsHidingTeam(!this.#foxTeam.isHidingTeam());
        }
    }

    #handleInteractHideSuccessEvent(data) {
        const { playerId, objectId } = data;
        // 나의 결과는 무시 (플레이어 채널로 받음)
        if (playerId === this.#me.getPlayerId()) {
            return;
        }
        console.log(`플레이어 ${playerId}가 ${objectId}에 숨기 성공`);
    }

    #handleInteractHideFailEvent(data) {
        const { playerId, objectId, item } = data;
        // 나의 결과는 무시 (플레이어 채널로 받음)
        if (playerId === this.#me.getPlayerId()) {
            return;
        }
        console.log(`플레이어 ${playerId}가 ${objectId}에 숨기 실패`);
    }

    #handleInteractSeekSuccessEvent(data) {
        const { playerId, objectId } = data;
        // 나의 결과는 무시 (플레이어 채널로 받음)
        if (playerId === this.#me.getPlayerId()) {
            return;
        }
        console.log(`플레이어 ${playerId}가 ${objectId}를 찾기 성공`);
    }

    #handleInteractSeekFailEvent(data) {
        const { playerId, objectId } = data;
        // 나의 결과는 무시 (플레이어 채널로 받음)
        if (playerId === this.#me.getPlayerId()) {
            return;
        }
        console.log(`플레이어 ${playerId}가 ${objectId}를 찾기 실패`);
    }

    initializePlayer(data) {
        // 플레이어 초기 정보 설정
        const { playerPositionInfo, teamCharacter, teamSubscriptionInfo } =
            data;

        this.#me = new Player({
            playerId: playerPositionInfo.playerId,
            playerNickname: "me",
            isReady: true,
        });
        this.#me.setPosition(playerPositionInfo);

        if (teamCharacter.toLowerCase() === "fox") {
            this.#me.setTeam(this.#foxTeam);
        } else {
            this.#me.setTeam(this.#racoonTeam);
        }

        // 팀 메시지 구독 시작
        this.startSubscribeTeam(teamSubscriptionInfo);
    }

    startSubscribeTeam(teamSubscriptionInfo) {
        this.#stompClient.subscribe(
            teamSubscriptionInfo,
            async (stompMessage) => {
                const message = JSON.parse(stompMessage.body);
                this.#handleTeamMessage(message);
            }
        );
    }

    #handleTeamMessage(message) {
        const { type, data } = message;
        switch (type) {
            case SHARE_POSITION:
                this.#handleSharePositionEvent(data);
                break;
            case COVER_SCREEN:
                break;
            case UNCOVER_SCREEN:
                break;
            case FREEZE:
                // this.#me.setCanMove(false);
                break;
            case UNFREEZE:
                // this.#me.setCanMove(true);
                break;
        }
    }

    #handleSharePositionEvent(data) {
        const { playerId, x, y, direction } = data;
        if (playerId === this.#me.getPlayerId()) {
            this.#me.setPosition({ x, y, direction });
        } else {
            const player = this.getPlayerWithId(playerId);
            player.setPosition({ x, y, direction });
        }
    }

    // 게임 시작 시각
    getStartedAt() {
        return this.#startedAt;
    }

    // 현재 페이즈
    getCurrentPhase() {
        return this.#currentPhase;
    }

    // 내 플레이어 정보
    getMe() {
        return this.#me;
    }

    // 해당 id를 가지는 플레이어를 찾아 반환
    getPlayerWithId(playerId) {
        return this.getAllPlayers().find(
            (player) => player.getPlayerId() === playerId
        );
    }

    // 내 위치 정보 수정
    setMyPosition(position) {
        const { x, y, direction } = position;
        this.#stompClient.publish({
            destination: `/ws/rooms/${this.#roomNumber}/game/share-position`,
            body: JSON.stringify({
                x,
                y,
                direction,
            }),
        });
    }

    getRacoonTeam() {
        return this.#racoonTeam;
    }

    getFoxTeam() {
        return this.#foxTeam;
    }

    getAllPlayers() {
        return this.#room.getJoinedPlayers();
    }

    // HP =====================================================================
    // 숨기 요청
    async requestHide(objectId) {
        const requestId = uuid();
        this.#stompClient.publish({
            destination: `/ws/rooms/${this.#roomNumber}/game/hide`,
            body: JSON.stringify({
                requestId,
                data: {
                    objectId,
                },
            }),
        });

        const hideResult = await asyncResponses.get(requestId);
        return Promise.resolve({
            isSucceeded: hideResult.type === INTERACT_HIDE_SUCCESS,
        });
    }

    // 탐색 요청
    async requestSeek(objectId) {
        const requestId = uuid();
        this.#stompClient.publish({
            destination: `/ws/rooms/${this.#roomNumber}/game/seek`,
            body: JSON.stringify({
                requestId,
                data: {
                    objectId,
                },
            }),
        });

        const { status, data } = await asyncResponses.get(requestId);
        if (status === INTERACT_SEEK_SUCCESS) {
            this.#handleSeekSuccessResult(data);
        } else {
            this.#handleSeekFailResult(data);
        }

        // TODO: 아이템 처리 필요
        return Promise.resolve({
            isSucceeded: status === INTERACT_SEEK_SUCCESS,
        });
    }

    // 찾기 성공 결과 반영
    #handleSeekSuccessResult(data) {
        const { foundPlayerId, objectId } = data;
        const restCatchCount = Player.MAX_SEEK_COUNT - data.catchCount;
        const requestedPlayerId = data.playerId;

        const foundPlayer = this.getPlayerWithId(foundPlayerId);
        const requestedPlayer = this.getPlayerWithId(requestedPlayerId);

        // 찾은 플레이어를 죽은 상태로 변경
        foundPlayer.setDead();
        // 남은 시도 횟수 갱신
        requestedPlayer.setRestSeekCount(restCatchCount);
        // 찾은 횟수 갱신
        requestedPlayer.increaseCatchCount();

        // TODO : HP에 뭔 짓을 해줘야 함?
    }

    // 찾기 실패 결과 반영
    #handleSeekFailResult(data) {
        const { objectId } = data;
        const restCatchCount = Player.MAX_SEEK_COUNT - data.catchCount;
        const requestedPlayerId = data.playerId;

        const requestedPlayer = this.getPlayerWithId(requestedPlayerId);
        // 남은 시도 횟수 갱신
        requestedPlayer.setRestSeekCount(restCatchCount);

        // TODO : HP에 뭔 짓을 해줘야 함?
        // TODO : 아이템 처리 필요
    }
}
