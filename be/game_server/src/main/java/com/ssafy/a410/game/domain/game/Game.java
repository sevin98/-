package com.ssafy.a410.game.domain.game;

import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.common.exception.UnhandledException;
import com.ssafy.a410.game.domain.Pos;
import com.ssafy.a410.game.domain.game.message.control.*;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.player.PlayerDirection;
import com.ssafy.a410.game.domain.player.PlayerPosition;
import com.ssafy.a410.game.domain.player.message.control.*;
import com.ssafy.a410.game.domain.player.message.request.GamePlayerRequest;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.domain.message.control.RoomMemberInfo;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

import static com.ssafy.a410.common.exception.ErrorDetail.PLAYER_NOT_IN_ROOM;

@Getter
@Slf4j
public class Game extends Subscribable implements Runnable {
    private static final int TOTAL_ROUND = 3;

    // 게임 맵
    private final GameMap gameMap;
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
        try {
            this.gameMap = new GameMap("map-2024-07-29");
        } catch (IOException e) {
            throw new UnhandledException("Failed to load game map");
        }
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
        // 나눠진 각 팀 플레이어들의 초기 위치 지정
        setInitialPlayerPositions(hidingTeam);
        setInitialPlayerPositions(seekingTeam);
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

    // 해당 팀에 속해 있는 플레이어들의 초기 위치를 겹치지 않게 지정
    private void setInitialPlayerPositions(Team team) {
        // 팀의 시작 위치 리스트를 섞고
        List<Pos> startPosList = gameMap.getStartPosBy(team);
        Collections.shuffle(startPosList);

        // 랜덤 지정
        int posIdx = 0;
        for (Player player : team.getPlayers().values()) {
            Pos startPos = startPosList.get(posIdx);
            player.setInitialPosition(startPos.getX(), startPos.getY(), PlayerDirection.DOWN);
            posIdx++;
        }
    }

    public boolean canJoin() {
        return this.currentPhase == null;
    }

    public boolean isRunning() {
        return this.currentPhase.isNowOrAfter(Phase.INITIALIZED);
    }

    public Team getRacoonTeam() {
        return this.hidingTeam.getCharacter() == Team.Character.RACOON ? this.hidingTeam : this.seekingTeam;
    }

    public Team getFoxTeam() {
        return this.hidingTeam.getCharacter() == Team.Character.FOX ? this.hidingTeam : this.seekingTeam;
    }

    @Override
    public void run() {
        initializeGame();
        for (int round = 1; round <= TOTAL_ROUND && !isGameFinished(); round++) {
            // 라운드 변경 알림
            log.debug("Room {} round {} start =======================================", room.getRoomNumber(), round);
            broadcastService.broadcastTo(this, new RoundChangeControlMessage(round, TOTAL_ROUND));

            log.debug("Room {} READY Phase start ------------------------------------", room.getRoomNumber());
            runReadyPhase();
            eliminateUnhidePlayers();

            log.debug("Room {} MAIN Phase start -------------------------------------", room.getRoomNumber());
            runMainPhase();

            log.debug("Room {} END Phase start --------------------------------------", room.getRoomNumber());
            runEndPhase();
            resetSeekCount();

            exitPlayers();
            resetHPObjects();
            swapTeam();
        }
        room.endGame();
    }

    private boolean isTimeToSwitch(long timeToSwitchPhase) {
        return System.currentTimeMillis() >= timeToSwitchPhase;
    }

    // 게임의 승패가 결정되었는지 확인
    private boolean isGameFinished() {
        // TODO : Implement game finish logic
        return hidingTeam.isEmpty() && seekingTeam.isEmpty();
    }

    private void initializeGame() {
        // 게임 시작 알림
        log.debug("방 번호 {}의 게임이 시작되었습니다.", this.room.getRoomNumber());
        broadcastService.broadcastTo(this, new GameStartMessage());
        // 게임 정보 전체 알림
        broadcastService.broadcastTo(this, new GameInfoMessage(new GameInfo(this)));

        // 각 팀의 플레이어들에게 각자의 초기화 정보 전송
        for (Player player : this.room.getPlayers().values()) {
            PlayerPosition info = new PlayerPosition(player);
            Team playerTeam = hidingTeam.has(player) ? hidingTeam : seekingTeam;
            PlayerInitializeMessage message = new PlayerInitializeMessage(info, playerTeam);
            broadcastService.unicastTo(player, message);
        }
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
                Player player = hidingTeam.getPlayerWithId(request.getPlayerId());
                request.handle(player, hidingTeam, this, broadcastService);
            }
        }
    }

    // 준비 페이즈 동안 안 숨은 플레이어들을 찾아서 탈락 처리한다.
    private void eliminateUnhidePlayers() {
        Map<String, Player> hidingTeamPlayers = hidingTeam.getPlayers();

        // 현재 게임 맵에서 숨은 상태에 있는 플레이어들을 나타냄
        Set<String> hpObjectKeys = gameMap.getHpObjects().keySet();

        // 숨는 역할 팀의 모든 플레이어에 대해 반복
        for (Map.Entry<String, Player> entry : hidingTeamPlayers.entrySet()) {
            String playerId = entry.getKey();
            Player player = entry.getValue();

            // 만약 플레이어는 숨지 않았을 경우
            if (!hpObjectKeys.contains(playerId)) {
                // 플레이어 탈락 처리
                player.setEliminated(true);
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
                Player player = seekingTeam.getPlayerWithId(request.getPlayerId());
                request.handle(player, seekingTeam, this, broadcastService);
            }
        }
    }

    private void runEndPhase() {
        this.currentPhase = Phase.END;
        broadcastService.broadcastTo(this, new PhaseChangeControlMessage(Phase.END));
    }

    // TODO: 후에 맵의 둘레 부분이 줄어들 경우, 위치를 계산하여 숨은 팀 플레이어들에게 송신
    // 현재는 플레이어가 숨기 전 마지막 위치를 반환한다.
    private void exitPlayers() {
        for(Player player : hidingTeam.getPlayers().values()) {
            broadcastService.unicastTo(player, new PlayerPositionMessage(new PlayerPosition(player)));
        }
    }

    // exitPlayers() 이후에 빠져나오기를 마친 후, HPObject들을 초기화
    private void resetHPObjects() {
        // Map 형식으로 hpObjects를 가져와서 반복하며 초기화
        Map<String, HPObject> hpObjects = gameMap.getHpObjects();
        for (HPObject hpObject : hpObjects.values()) {
            hpObject.unhidePlayer();
            hpObject.removeItem();
        }
    }

    private void swapTeam() {
        // 숨는 팀과 찾는 팀의 역할을 교환
        List<Player> hidingTeamPlayers = new ArrayList<>(hidingTeam.getPlayers().values());
        Team.Character hidingTeamCharacter = hidingTeam.getCharacter();
        List<Player> seekingTeamPlayers = new ArrayList<>(seekingTeam.getPlayers().values());
        Team.Character seekingTeamCharacter = seekingTeam.getCharacter();

        hidingTeam.clearPlayers();
        seekingTeam.clearPlayers();

        for (Player player : hidingTeamPlayers) {
            seekingTeam.addPlayer(player);
        }
        seekingTeam.setCharacter(hidingTeamCharacter);

        for (Player player : seekingTeamPlayers) {
            hidingTeam.addPlayer(player);
        }
        hidingTeam.setCharacter(seekingTeamCharacter);
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

    public Team getTeamOf(Team.Character character) {
        return hidingTeam.getCharacter() == character ? hidingTeam : seekingTeam;
    }

    public Team getTeamOf(Player player) {
        return hidingTeam.has(player) ? hidingTeam : seekingTeam;
    }

    public void pushMessage(Player player, GamePlayerRequest request) {
        if (hidingTeam.has(player)) {
            hidingTeamRequests.add(request);
        } else if (seekingTeam.has(player)) {
            seekingTeamRequests.add(request);
        }
    }

    public void eliminate(Player player) {
        List<Player> allPlayers = new ArrayList<>(room.getPlayers().values());
        if (allPlayers.contains(player))
            player.eliminate();
        else
            throw new ResponseException(PLAYER_NOT_IN_ROOM);
    }

    // 라운드가 끝날 때 탐색 카운트 초기화
    private void resetSeekCount(){
        for(Player player : hidingTeam.getPlayers().values()){
            player.initSeekCount();
        }
    }
}
