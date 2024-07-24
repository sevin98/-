package com.ssafy.a410.game.domain;

import com.ssafy.a410.common.exception.handler.GameException;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Game {
    // 플레이어들이 속해 있는 방
    private final Room room;
    // 숨는 팀 플레이어 모음
    private final Map<String, Player> hidingTeamPlayers;
    // 찾는 팀 플레이어 모음
    private final Map<String, Player> seekingTeamPlayers;
    // 현재 게임이 머물러 있는 상태(단계)
    @Setter
    private Phase currentPhase;
    // 방 초기화 안전 장치
    private boolean isInitialized = false;

    private Game(Room room) {
        // 멤버 초기화
        this.hidingTeamPlayers = new ConcurrentHashMap<>();
        this.seekingTeamPlayers = new ConcurrentHashMap<>();
        this.room = room;

        // 방에 실행 중인 게임으로 연결
        room.setPlayingGame(this);
    }

    public static Game createNewGame(Room room) {
        // 아직 시작되지 않은 새 게임 만들기
        Game newGame = new Game(room);

        // Phase.NOT_STARTED 상태가 되기 위한 조건을 초기화
        newGame.initialize();

        return newGame;
    }

    private void initialize() {
        if (isInitialized) {
            throw new GameException("Game is already initialized");
        } else {
            isInitialized = true;
        }

        // 랜덤으로 플레이어 편 나누기
        randomAssignPlayersToTeam();
        // TODO : 봇 채우기

        // 게임을 시작할 준비가 되었음을 표시
        this.currentPhase = Phase.NOT_STARTED;
    }

    private void randomAssignPlayersToTeam() {
        // 모든 멤버를 섞고
        List<Player> allPlayers = new ArrayList<>(room.getPlayers().values());
        Collections.shuffle(allPlayers);

        // 멤버를 반씩, 최대 1명 차이가 나도록 나누어 숨는 팀과 찾는 팀으로 나누기
        for (int i = 0; i < allPlayers.size(); i++) {
            Player player = allPlayers.get(i);
            if (i % 2 == 0) {
                hidingTeamPlayers.put(player.getId(), player);
            } else {
                seekingTeamPlayers.put(player.getId(), player);
            }
        }
    }

    public boolean isGameRunning() {
        return currentPhase == Phase.READY || currentPhase == Phase.MAIN || currentPhase == Phase.END;
    }

    enum Phase {
        // 게임이 시작할 준비가 된 상태
        NOT_STARTED,
        // 숨는 팀이 숨을 곳을 찾는 상태
        READY,
        // 찾는 팀이 숨은 팀을 찾고 있는 상태
        MAIN,
        // 다음 라운드를 위해 기존의 게임 상태를 정리하고 있는 상태
        END,
        // 게임이 끝난 상태
        FINISHED
    }
}
