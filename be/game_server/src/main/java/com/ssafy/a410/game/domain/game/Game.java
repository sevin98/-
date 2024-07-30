package com.ssafy.a410.game.domain.game;

import com.ssafy.a410.game.domain.game.message.control.*;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.player.message.control.PlayerCoverScreenMessage;
import com.ssafy.a410.game.domain.player.message.control.PlayerFreezeMessage;
import com.ssafy.a410.game.domain.player.message.control.PlayerUncoverScreenMessage;
import com.ssafy.a410.game.domain.player.message.control.PlayerUnfreezeMessage;
import com.ssafy.a410.game.domain.player.message.request.GamePlayerRequest;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.domain.message.control.RoomMemberInfo;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

@Getter
@Slf4j
public class Game extends Subscribable implements Runnable {
    private static final int TOTAL_ROUND = 3;

    // 플레이어들이 속해 있는 방
    private final Room room;
    // 숨는 팀
    private final Team hidingTeam;
    private final Queue<GamePlayerRequest> hidingTeamRequests;
    // 찾는 팀
    private final Team seekingTeam;
    private final Queue<GamePlayerRequest> seekingTeamRequests;
    private final MessageBroadcastService broadcastService;
    // 현재 게임이 머물러 있는 상태(단계)
    private Phase currentPhase;

    public Game(Room room, MessageBroadcastService broadcastService) {
        this.room = room;
        this.hidingTeam = new Team(Team.Character.RACOON, this);
        this.hidingTeamRequests = new ConcurrentLinkedDeque<>();
        this.seekingTeam = new Team(Team.Character.FOX, this);
        this.seekingTeamRequests = new ConcurrentLinkedDeque<>();
        this.broadcastService = broadcastService;
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
        return this.currentPhase == null;
    }

    public boolean isRunning() {
        return this.currentPhase.isNowOrAfter(Phase.INITIALIZED);
    }

    @Override
    public void run() {
        // 게임 시작 알림
        log.debug("방 번호 {}의 게임이 시작되었습니다.", this.room.getRoomNumber());
        broadcastService.broadcastTo(this, new GameStartMessage());
        for (int round = 1; round <= TOTAL_ROUND && !isGameFinished(); round++) {
            // 라운드 변경 알림
            log.debug("Room {} round {} start =======================================", room.getRoomNumber(), round);
            broadcastService.broadcastTo(this, new RoundChangeControlMessage(round, TOTAL_ROUND));

            log.debug("Room {} READY Phase start ------------------------------------", room.getRoomNumber());
            runReadyPhase();

            log.debug("Room {} MAIN Phase start -------------------------------------", room.getRoomNumber());
            runMainPhase();

            log.debug("Room {} END Phase start --------------------------------------", room.getRoomNumber());
            runEndPhase();

            swapTeam();
        }
        room.endGame();
    }

    private void swapTeam() {
        // 숨는 팀과 찾는 팀의 역할을 교환
        List<Player> hidingPlayers = new ArrayList<>(hidingTeam.getPlayers().values());
        List<Player> seekingPlayers = new ArrayList<>(seekingTeam.getPlayers().values());

        hidingTeam.clearPlayers();
        seekingTeam.clearPlayers();

        for (Player player : hidingPlayers) {
            seekingTeam.addPlayer(player);
        }

        for (Player player : seekingPlayers) {
            hidingTeam.addPlayer(player);
        }
    }

    private boolean isTimeToSwitch(long timeToSwitchPhase) {
        return System.currentTimeMillis() >= timeToSwitchPhase;
    }

    // 게임의 승패가 결정되었는지 확인
    private boolean isGameFinished() {
        // TODO : Implement game finish logic
        return hidingTeam.isEmpty() && seekingTeam.isEmpty();
    }

    private void runReadyPhase() {
        // 상태 전환
        this.currentPhase = Phase.READY;
        broadcastService.broadcastTo(this, new PhaseChangeControlMessage(Phase.READY));

        // 숨는 팀만 움직일 수 있으며, 화면 가리기 해제 설정
        broadcastService.broadcastTo(hidingTeam, new PlayerUnfreezeMessage());
        broadcastService.broadcastTo(hidingTeam, new PlayerUncoverScreenMessage());
        hidingTeam.unfreezePlayers();

        // 찾는 팀은 움직일 수 없으며, 화면 가리기 설정
        broadcastService.broadcastTo(seekingTeam, new PlayerFreezeMessage());
        broadcastService.broadcastTo(seekingTeam, new PlayerCoverScreenMessage());
        seekingTeam.freezePlayers();

        // 요청 처리 큐 초기화
        hidingTeamRequests.clear();

        // 제한 시간이 끝날 때까지 루프 반복
        final long TIME_TO_SWITCH = System.currentTimeMillis() + Phase.READY.getDuration();
        while (!isTimeToSwitch(TIME_TO_SWITCH) && !isGameFinished()) {
            // 현 시점까지 들어와 있는 요청까지만 처리
            final int NUM_OF_MESSAGES = hidingTeamRequests.size();
            for (int cnt = 0; cnt < NUM_OF_MESSAGES; cnt++) {
                GamePlayerRequest request = hidingTeamRequests.poll();
            }
        }
    }

    private void runMainPhase() {
        this.currentPhase = Phase.MAIN;
        broadcastService.broadcastTo(this, new PhaseChangeControlMessage(Phase.MAIN));

        // 숨는 팀은 움직일 수 없으며, 화면 가리기 해제 설정
        broadcastService.broadcastTo(hidingTeam, new PlayerFreezeMessage());
        broadcastService.broadcastTo(hidingTeam, new PlayerUncoverScreenMessage());
        hidingTeam.freezePlayers();

        // 찾는 팀은 움직일 수 있으며, 화면 가리기 해제 설정
        broadcastService.broadcastTo(seekingTeam, new PlayerUnfreezeMessage());
        broadcastService.broadcastTo(seekingTeam, new PlayerUncoverScreenMessage());
        seekingTeam.unfreezePlayers();

        // 요청 처리 큐 초기화
        seekingTeamRequests.clear();

        // 제한 시간이 끝날 때까지 루프 반복
        final long TIME_TO_SWITCH = System.currentTimeMillis() + Phase.MAIN.getDuration();
        while (!isTimeToSwitch(TIME_TO_SWITCH) && !isGameFinished()) {
            // 현 시점까지 들어와 있는 요청까지만 처리
            final int NUM_OF_MESSAGES = seekingTeamRequests.size();
            for (int cnt = 0; cnt < NUM_OF_MESSAGES; cnt++) {
                GamePlayerRequest request = seekingTeamRequests.poll();
            }
        }
    }

    private void runEndPhase() {
        this.currentPhase = Phase.END;
        broadcastService.broadcastTo(this, new PhaseChangeControlMessage(Phase.END));
    }

    public void kick(Player player) {
        if (hidingTeam.has(player))
            hidingTeam.removePlayer(player);
        else if (seekingTeam.has(player))
            seekingTeam.removePlayer(player);
    }

    @Override
    public String getTopic() {
        return "/topic/rooms/" + room.getRoomNumber() + "/game";
    }

    // player는 현재 사용하지 않지만, 후에 "player가 나갔습니다" 를 뿌려줄까봐 유지함
    public void notifyDisconnection(Player player) {
        GameControlMessage message = new GameControlMessage(
                GameControlType.PLAYER_DISCONNECTED,
                RoomMemberInfo.getAllInfoListFrom(this.getRoom())
        );
        broadcastService.broadcastTo(this, message);
    }
}
