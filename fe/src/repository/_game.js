import { v4 as uuid } from "uuid";

import { getStompClient } from "../network/StompClient";
import { Team, Player, PLAYER_ELIMINATION_REASON } from "./interface";
import asyncResponses from "./_asyncResponses";
import { Mutex } from "async-mutex";
import uiControlQueue from "../util/UIControlQueue";

// 게임 시작 이벤트
const GAME_START = "GAME_START";
// 게임 정보 전달 이벤트
const GAME_INFO = "GAME_INFO";
// 라운드 전환 이벤트
const ROUND_CHANGE = "ROUND_CHANGE";
// 페이즈 전환 이벤트
const PHASE_CHANGE = "PHASE_CHANGE";
// 게임 종료 이벤트
const GAME_END = "GAME_END";
// 숨기 성공 이벤트
const INTERACT_HIDE_SUCCESS = "INTERACT_HIDE_SUCCESS";
// 숨기 실패 이벤트
const INTERACT_HIDE_FAIL = "INTERACT_HIDE_FAIL";
// 찾기 성공 이벤트
const INTERACT_SEEK_SUCCESS = "INTERACT_SEEK_SUCCESS";
// 찾기 실패 이벤트
const INTERACT_SEEK_FAIL = "INTERACT_SEEK_FAIL";
// 플레이어가 숨지 못했을 때 탈락 이벤트
const FAILED_TO_HIDE = "FAILED_TO_HIDE";
// 플레이어 게임 이탈 이벤트
const PLAYER_DISCONNECTED = "PLAYER_DISCONNECTED";
// 안전 구역 업데이트 이벤트
const SAFE_ZONE_UPDATE = "SAFE_ZONE_UPDATE";
// 안전구역밖으로 나간 플레이어 게임 탈락 이벤트
const ELIMINATION_OUT_OF_SAFE_ZONE = "ELIMINATION_OUT_OF_SAFE_ZONE";
// 게임 종료 시 게임 결과 수신 이벤트
const GAME_RESULT = "GAME_RESULT";

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
    static GAME_END = "GAME_END";
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
    #nextPhaseChangeAt;
    #currentPhaseFinishAfterMilliSec;
    #currentSafeZone;
    #isGameEnd = false;
    #gameResults = [];

    #isInitialized = false;
    #currentEliminatedPlayerAndTeam; //ui업데이트
    #seekFailCatchCount = 0; // 기본값 0

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
        }, 10);
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
            case GAME_END:
                this.#handleGameEndEvent(data);
                break;
            case INTERACT_HIDE_SUCCESS:
                this.#handleInteractHideSuccessEvent(data);
                break;
            case INTERACT_HIDE_FAIL:
                this.#handleInteractHideFailEvent(data);
                break;
            case INTERACT_SEEK_FAIL:
                this.#handleInteractSeekFailEvent(data);
                break;
            case INTERACT_SEEK_SUCCESS:
                this.#handlePlayerDeath(PLAYER_ELIMINATION_REASON.CAUGHT, data);
                break;
            case FAILED_TO_HIDE:
                this.#handlePlayerDeath(
                    PLAYER_ELIMINATION_REASON.FAILED_TO_HIDE,
                    data
                );
                console.log(
                    `플레이어 ${data.playerId}님이 숨지 못해 탈락하셨습니다.`
                );
                break;
            case PLAYER_DISCONNECTED:
                this.#handlePlayerDeath(
                    PLAYER_ELIMINATION_REASON.PLAYER_DISCONNECTED,
                    data
                );
                console.log(`플레이어 ${data.playerId}님이 이탈하셨습니다.`);
                break;
            case ELIMINATION_OUT_OF_SAFE_ZONE:
                this.#handlePlayerDeath(
                    PLAYER_ELIMINATION_REASON.OUT_OF_SAFE_ZONE,
                    data
                );
                console.log(
                    `플레이어 ${data.playerId}님이 안전구역을 벗어나 탈락하셨습니다.`
                );
                break;
            case SAFE_ZONE_UPDATE:
                //맵축소
                this.#handleSafeZoneUpdateEvent(data);
                console.log(`안전 지역이 변경되었습니다.`);
                break;
            case GAME_RESULT:
                this.#handleGameResultEvent(data);
                console.log("게임 결과를 수신했습니다.");
                break;
            default:
                console.error("Received unknown message:", message);
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
        this.#currentPhase = data.phase;
        this.#nextPhaseChangeAt = new Date(
            Date.now() + data.finishAfterMilliSec
        );
        this.#currentPhaseFinishAfterMilliSec = data.finishAfterMilliSec;

        console.log(
            `페이즈 변경: ${data.phase}, ${data.finishAfterMilliSec}ms 후 종료`
        );

        if (this.#currentPhase === Phase.END) {
            // 한 라운드가 끝나면 역할 반전
            this.#racoonTeam.setIsHidingTeam(!this.#racoonTeam.isHidingTeam());
            this.#foxTeam.setIsHidingTeam(!this.#foxTeam.isHidingTeam());
        } else if (this.#currentPhase === Phase.GAME_END) {
            this.#setIsEnd();
        }

        this.getMe().then(async (me) => {
            if (
                this.#currentPhase === Phase.READY ||
                this.#currentPhase === Phase.MAIN
            ) {
                uiControlQueue.addPhaseChangeMessage(
                    this.#currentPhase,
                    data.finishAfterMilliSec
                );
            }
            if (this.#currentPhase === Phase.READY) {
                if (await me.isHidingTeam()) {
                    console.log(
                        `당신의 팀이 숨을 차례입니다. ${data.finishAfterMilliSec}ms 안에 숨지 못하면 탈락합니다.`
                    );

                    // 화면에 찾는 팀, 숨는 팀 플레이어들이 보이게 하기
                    this.#setTeamPlayersVisibility(this.getSeekingTeam(), true);
                    this.#setTeamPlayersVisibility(this.getHidingTeam(), true);

                    // 남은 찾는 횟수 UI 제거
                    uiControlQueue.addHideSeekCountUiMessage();
                } else {
                    console.log(
                        `당신의 팀이 찾을 차례입니다. ${data.finishAfterMilliSec}ms 후에 상대 팀을 찾을 수 있습니다.`
                    );

                    // 화면에 찾는 팀 플레이어들이 보이게 하기
                    this.#setTeamPlayersVisibility(this.getSeekingTeam(), true);
                    // 화면에 숨는 팀 플레이어들이 보이지 않게 하기
                    this.#setTeamPlayersVisibility(this.getHidingTeam(), false);

                    // 남은 찾는 횟수 UI 초기화
                    uiControlQueue.addShowSeekCountUiMessage();
                }
            } else if (this.#currentPhase === Phase.MAIN) {
                if (await me.isHidingTeam()) {
                    console.log(
                        `앞으로 ${data.finishAfterMilliSec}ms 동안 들키지 않으면 생존합니다.`
                    );

                    // 화면에 찾는 팀 플레이어들이 보이게 하기
                    this.#setTeamPlayersVisibility(this.getSeekingTeam(), true);
                    // 화면에 숨는 팀 플레이어들이 보이지 않게 하기
                    this.#setTeamPlayersVisibility(this.getHidingTeam(), false);
                } else {
                    console.log(
                        `앞으로 ${data.finishAfterMilliSec}ms 동안 상대 팀을 찾아야 합니다.`
                    );

                    // 화면에 찾는 팀 플레이어들이 보이게 하기
                    this.#setTeamPlayersVisibility(this.getSeekingTeam(), true);
                    // 화면에 숨는 팀 플레이어들이 보이지 않게 하기
                    this.#setTeamPlayersVisibility(this.getHidingTeam(), false);
                }
            }
        });
    }

    #handleGameEndEvent() {
        this.#setIsEnd();
    }

    #setIsEnd() {
        this.#isGameEnd = true;
    }

    getIsEnd() {
        return this.#isGameEnd;
    }

    #setTeamPlayersVisibility(team, isVisible) {
        for (let player of team.getPlayers()) {
            // 내 플레이어의 가시성은 Game.js에서 별도 처리
            if (player.getPlayerId() === this.#me.getPlayerId()) {
                continue;
            }

            player.getSprite().then((sprite) => {
                if (player.isDead()) {
                    sprite.visible = false;
                } else {
                    sprite.visible = isVisible;
                }
            });
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
        const {
            playerPositionInfo,
            teamCharacter,
            teamSubscriptionInfo,
            playerNickname,
        } = data;

        console.log(`내 정보 초기화: ${playerPositionInfo.playerId}`);

        this.#me = new Player({
            playerId: playerPositionInfo.playerId,
            playerNickname,
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

    #handleGameResultEvent(data) {
        console.log(data);
        Object.keys(data).forEach((team) => {
            data[team].forEach((player) => {
                this.#gameResults.push({
                    nickname: player.nickname,
                    catchCount: player.catchCount,
                    playTime: player.playTimeInSeconds,
                    team: player.team,
                });
            });
        });
    }

    // gameResults getter
    getGameResults() {
        return this.#gameResults;
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
        if (this.#me) {
            return Promise.resolve(this.#me);
        } else {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (this.#me) {
                        clearInterval(interval);
                        resolve(this.#me);
                    }
                }, 10);
            });
        }
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

    getHidingTeam() {
        return this.#foxTeam.isHidingTeam() ? this.#foxTeam : this.#racoonTeam;
    }

    getSeekingTeam() {
        return this.#foxTeam.isHidingTeam() ? this.#racoonTeam : this.#foxTeam;
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

        const seekResult = await asyncResponses.get(requestId);

        if (seekResult.type === "INTERACT_SEEK_SUCCESS") {
            this.#handleSeekSuccessResult(seekResult.data);
        } else {
            this.#handleSeekFailResult(seekResult.data);
        }

        // TODO: 아이템 처리 필요
        return Promise.resolve({
            isSucceeded: seekResult.type === INTERACT_SEEK_SUCCESS,
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

        uiControlQueue.addUpdateSeekCountUiMessage(restCatchCount);

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

        uiControlQueue.addUpdateSeekCountUiMessage(restCatchCount);
        this.#seekFailCatchCount = data.catchCount;

        // TODO : HP에 뭔 짓을 해줘야 함?
        // TODO : 아이템 처리 필요
    }

    getSeekFailCount() {
        return this.#seekFailCatchCount;
    }

    getNextPhaseChangeAt() {
        return this.#nextPhaseChangeAt;
    }

    getCurrentPhaseFinishAfterMilliSec() {
        return this.#currentPhaseFinishAfterMilliSec;
    }
    //맵축소
    #handleSafeZoneUpdateEvent(data) {
        const safeZone = data; //[0, 0, 1600, 1600],
        this.#currentSafeZone = safeZone;
    }
    //맵축소
    getCurrentSafeZone() {
        return this.#currentSafeZone;
    }

    getCurrentEliminatedPlayerAndTeam() {
        return this.#currentEliminatedPlayerAndTeam;
    }

    #handlePlayerDeath(reasonType, data) {
        const { playerId, foundPlayerId } = data;

        this.getMe().then((me) => {
            // 잡혀서 죽은거면
            if (reasonType === PLAYER_ELIMINATION_REASON.CAUGHT) {
                // 해당 플레이어를 탈락 처리
                const player = this.getPlayerWithId(foundPlayerId);
                player.setDead();
                data.victimPlayerNickname = player.getPlayerNickname();
                // 공격자 정보 추가
                data.attackerNickname = this.getPlayerWithId(
                    data.playerId
                ).getPlayerNickname();
            }
            // 발견 당한 플레이어 정보가 없는데 playerId가 나이면
            else if (me.getPlayerId() === playerId) {
                // 나를 탈락 처리
                me.setDead();
                data.victimPlayerNickname = me.getPlayerNickname();
            }
            // 이외의 경우 다른 플레이어의 탈락을 의미함
            else {
                const player = this.getPlayerWithId(playerId);
                player.setDead();
                data.victimPlayerNickname = player.getPlayerNickname();
            }

            // 사망 메시지 표시
            uiControlQueue.addDeadMessage(reasonType, data);
        });
    }
}
