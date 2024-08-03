import { getStompClient } from "../network/StompClient";
import { Team } from "./interface";

// 게임 시작 이벤트
const GAME_START = "GAME_START";
// 게임 정보 전달 이벤트
const GAME_INFO = "GAME_INFO";
// 라운드 전환 이벤트
const ROUND_CHANGE = "ROUND_CHANGE";
// 페이즈 전환 이벤트
const PHASE_CHANGE = "PHASE_CHANGE";

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

    constructor(roomNumber, gameSubscriptionInfo, startsAfterMilliSec) {
        this.#roomNumber = roomNumber;

        const initializationTrial = setInterval(() => {
            getStompClient()
                .then((client) => {
                    clearInterval(initializationTrial);
                    this.#stompClient = client;
                    this.startSubscribe(gameSubscriptionInfo);
                })
                .catch((e) => {});
        }, 100);
        
    }

    startSubscribe(gameSubscriptionInfo) {
        this.#stompClient.subscribe(
            gameSubscriptionInfo,
            async (stompMessage) => {
                const message = JSON.parse(stompMessage.body);
                this.#handleMessage(message);
            }
        );
    }

    #handleMessage(message) {
        const { type, data } = message;
        console.log(message);
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
                throw new Error("Unknown message type in GameRepository");
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

        console.log(this.#racoonTeam.isRacoonTeam());
    }

    #handleRoundChangeEvent(data) {
        console.log(`라운드 변경: ${data.nextRound}/${data.totalRound}`);
    }

    #handlePhaseChangeEvent(data) {
        console.log(
            `페이즈 변경: ${data.phase}, ${data.finishAfterMilliSec}ms 후 종료`
        );
    }

    // 게임 시작 시각
    getStartedAt() {
        return this.#startedAt;
    }

    // 현재 페이즈
    getCurrentPhase() {
        return this.#currentPhase;
    }
}
