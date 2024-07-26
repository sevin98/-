package com.ssafy.a410.game.domain;

import com.ssafy.a410.common.constant.MilliSecOf;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
public class Game implements Runnable {
    // 플레이어들이 속해 있는 방
    private final Room room;
    // 숨는 팀
    private final Team hidingTeam;
    // 찾는 팀
    private final Team seekingTeam;
    // 방 초기화 안전 장치
    // 현재 게임이 머물러 있는 상태(단계)
    private Phase currentPhase;

    public Game(Room room) {
        this.room = room;
        this.hidingTeam = new Team(Team.Character.RACOON);
        this.seekingTeam = new Team(Team.Character.FOX);
        initialize();
    }

    private void initialize() {
        // 초기화 시작 (게임 진입 불가)
        this.currentPhase = Phase.INITIALIZING;

        // 랜덤으로 플레이어 편 나누기
        randomAssignPlayersToTeam();
        // 방에 실행 중인 게임으로 연결
        room.setPlayingGame(this);

        // 게임 시작 준비 완료
        this.currentPhase = Phase.INITIALIZED;
    }

    private void randomAssignPlayersToTeam() {
        // 모든 멤버를 섞고
        List<Player> allPlayers = new ArrayList<>(room.getPlayers().values());
        Collections.shuffle(allPlayers);

        // 멤버를 반씩, 최대 1명 차이가 나도록 나누어 숨는 팀과 찾는 팀으로 나누기
        for (int i = 0; i < allPlayers.size(); i++) {
            Player player = allPlayers.get(i);
            if (i % 2 == 0) {
                hidingTeam.addPlayer(player);
            } else {
                seekingTeam.addPlayer(player);
            }
        }
    }

    public boolean canJoin() {
        return this.currentPhase != null && this.currentPhase.isNowOrBefore(Phase.INITIALIZING);
    }

    public boolean isGameRunning() {
        return this.currentPhase.isNowOrAfter(Phase.INITIALIZED);
    }

    @Override
    public void run() {
        int currentRound = 1;
        this.currentPhase = Phase.READY;
        log.info("Game start!");

        while (isGameRunning() && currentRound <= 3 && !isGameFinished()) {
            log.info("Round: {}", currentRound);
            // READY Phase ============================================================================================
            long timeToSwitchPhase = System.currentTimeMillis() + 3L * MilliSecOf.SECONDS; // READY -> MAIN
            while (System.currentTimeMillis() < timeToSwitchPhase && !isGameFinished()) {
                if (isTimeToSwitch(timeToSwitchPhase)) {
                    log.info("Switching phase from READY to MAIN");
                    break;
                }
            }

            // MAIN Phase =============================================================================================
            timeToSwitchPhase = System.currentTimeMillis() + 3L * MilliSecOf.SECONDS; // MAIN -> END
            while (System.currentTimeMillis() < timeToSwitchPhase && !isGameFinished()) {
                if (isTimeToSwitch(timeToSwitchPhase)) {
                    log.info("Switching phase from MAIN to END");
                    break;
                }
            }

            // END Phase ==============================================================================================
            log.info("END PHASE");
            currentRound++;
        }
    }

    private boolean isTimeToSwitch(long timeToSwitchPhase) {
        return System.currentTimeMillis() >= timeToSwitchPhase;
    }

    // 게임의 승패가 결정되었는지 확인
    private boolean isGameFinished() {
        return false;
    }
}
