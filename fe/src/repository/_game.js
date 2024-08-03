import { getStompClient } from "../network/StompClient";
import { Team, Player } from "./interface";

// 게임 시작 이벤트
const GAME_START = "GAME_START";
// 게임 정보 전달 이벤트
const GAME_INFO = "GAME_INFO";
// 라운드 전환 이벤트
const ROUND_CHANGE = "ROUND_CHANGE";
// 페이즈 전환 이벤트
const PHASE_CHANGE = "PHASE_CHANGE";
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
    #roomNumber;
    #stompClient;
    #startedAt;
    #currentPhase;
    #foxTeam;
    #racoonTeam;
    #me;

    constructor(roomNumber, gameSubscriptionInfo, startsAfterMilliSec) {
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

    #handleGameMessage(message) {
        const { type, data } = message;
        switch (type) {
            case GAME_START:
                this.#handleGameStartEvent(data);
                break;
            case GAME_INFO:
                this.#handleGameInfoEvent(data);
                break;
            case ROUND_CHANGE:
                this.#handleRoundChangeEvent(data);
                break;
            case PHASE_CHANGE:
                this.#handlePhaseChangeEvent(data);
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
        if (this.#currentPhase === Phase.END) {
            this.#racoonTeam.setIsHidingTeam(!this.#racoonTeam.isHidingTeam());
            this.#foxTeam.setIsHidingTeam(!this.#foxTeam.isHidingTeam());
        }
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
        this.#me.setCharacter(teamCharacter.toLowerCase());
        this.#me.setPosition(playerPositionInfo);

        if (this.#me.isFoxTeam()) {
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
            return;
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
}

