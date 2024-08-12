package com.ssafy.a410.game.domain.game;

import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.constant.MilliSecOf;
import com.ssafy.a410.common.exception.ErrorDetail;
import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.common.exception.UnhandledException;
import com.ssafy.a410.game.domain.Pos;
import com.ssafy.a410.game.domain.game.item.ItemUseReq;
import com.ssafy.a410.game.domain.game.message.DirectionHintMessage;
import com.ssafy.a410.game.domain.game.message.EliminationOutOfSafeZoneMessage;
import com.ssafy.a410.game.domain.game.message.control.*;
import com.ssafy.a410.game.domain.game.message.control.item.ItemApplicationFailedMessage;
import com.ssafy.a410.game.domain.game.message.control.item.ItemAppliedMessage;
import com.ssafy.a410.game.domain.game.message.control.item.ItemAppliedToHPObjectMessage;
import com.ssafy.a410.game.domain.game.message.control.item.ItemClearedMessage;
import com.ssafy.a410.game.domain.player.*;
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
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static com.ssafy.a410.common.exception.ErrorDetail.PLAYER_NOT_IN_ROOM;

@Getter
@Slf4j
public class Game extends Subscribable implements Runnable {

    private static final int SAFE_ZONE_REDUCE_AMOUNT = 100;
    private static final int SAFE_ZONE_REDUCE_DURATION = 10;

    private static final int TOTAL_ROUND = 5;
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
    private final UserService userService;
    // 현재 게임이 머물러 있는 상태(단계)
    private Phase currentPhase;

    private int round;

    public Game(Room room, MessageBroadcastService broadcastService, UserService userService) {
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
        this.userService = userService;
        gameMap.setGameToHpObjects(this);
        initialize();
    }

    private void initializeGameMap() {
        gameMap.getHpObjects().values().forEach(hpObject -> hpObject.setGame(this));
    }

    private void initialize() {
        // 초기화 시작 (게임 진입 불가)
        this.currentPhase = Phase.INITIALIZING;
        this.round = 0;
        // 랜덤으로 플레이어 편 나누기
        randomAssignPlayersToTeam();
        // 나눠진 각 팀 플레이어들의 초기 위치 지정
        setInitialPlayerPositions(hidingTeam);
        setInitialPlayerPositions(seekingTeam);
        // 방에 실행 중인 게임으로 연결
        room.setPlayingGame(this);
        initializeGameMap();
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

        // 각팀에 모자란 인원 만큼 봇으로 채워넣기
//        for(int i = 0 ; i < 4 - hidingTeam.getPlayers().size(); i ++){
//            Player bot = createBot();
//            hidingTeam.addPlayer(bot);
//        }
//
//        for(int i = 0 ; i < 4 - seekingTeam.getPlayers().size(); i ++){
//            Player bot = createBot();
//            seekingTeam.addPlayer(bot);
//        }
    }

    private Player createBot() {
        return new Player(room, true);
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
        log.info("방 {} 게임 초기화", room.getRoomNumber());
        initializeGame();

        // 클라이언트가 초기화 할 시간 주기
        try {
            Thread.sleep(2L * MilliSecOf.SECONDS);
        } catch (InterruptedException e) {
            throw new UnhandledException("Game start interrupted");
        }

        for (int round = 1; round <= TOTAL_ROUND && !isEnd(); round++) {
            // 라운드 변경 알림
            log.debug("Room {} round {} start =======================================", room.getRoomNumber(), round);
            broadcastService.broadcastTo(this, new RoundChangeControlMessage(round, TOTAL_ROUND));

            log.debug("Room {} READY Phase start ------------------------------------", room.getRoomNumber());
            runReadyPhase();
//            hideBotPlayers();
            eliminateUnhidePlayers();

            log.debug("Room {} MAIN Phase start -------------------------------------", room.getRoomNumber());
            runMainPhase();

            log.debug("Room {} END Phase start --------------------------------------", room.getRoomNumber());
            runEndPhase();
            reduceSafeZoneWithElimination();
            resetSeekCount();
            exitPlayers();
            resetHPObjects();
            swapTeam();
        }

        // 루프 안에서 게임 승패가 갈리지 않은 경우
        if (this.currentPhase != Phase.FINISHED) {
            // 게임이 끝났을 때
            log.debug("Room {} Game finished --------------------------------------", room.getRoomNumber());
            // 종료 처리 및 승패 판정
            setGameFinished();
            checkForVictory();
        }

        room.endGame();
        resetAllItems();
    }

    private boolean isTimeToSwitch(long timeToSwitchPhase) {
        return System.currentTimeMillis() >= timeToSwitchPhase;
    }

    // 게임의 승패가 결정되었는지 확인
    private boolean isEnd() {
        boolean hasRestPlayers = !hidingTeam.isEmpty() || !seekingTeam.isEmpty();
        boolean isRacoonTeamAllEliminated = getRacoonTeam().isAllPlayerEliminated();
        boolean isFoxTeamAllEliminated = getFoxTeam().isAllPlayerEliminated();
        return (this.currentPhase == Phase.FINISHED) || !hasRestPlayers || (isRacoonTeamAllEliminated || isFoxTeamAllEliminated);
    }

    private void initializeGame() {
        // 게임 시작 알림
        broadcastService.broadcastTo(this, new GameStartMessage());
        // 게임 정보 전체 알림
        broadcastService.broadcastTo(this, new GameInfoMessage(new GameInfo(this)));

        // 각 팀의 플레이어들에게 각자의 초기화 정보 전송
        for (Player player : this.room.getPlayers().values()) {
            player.reset();
            player.setPlayerStartTime();
            PlayerPosition info = new PlayerPosition(player);
            Team playerTeam = hidingTeam.has(player) ? hidingTeam : seekingTeam;
            PlayerInitializeMessage message = new PlayerInitializeMessage(info, playerTeam);
            broadcastService.unicastTo(player, message);

            // 양 팀에 소속된 플레이어들에게 최초 위치는 송신
            PlayerPositionMessage positionMessage = new PlayerPositionMessage(info);
            broadcastService.broadcastTo(hidingTeam, positionMessage);
            broadcastService.broadcastTo(seekingTeam, positionMessage);
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
        while (!isTimeToSwitch(TIME_TO_SWITCH) && !isEnd()) {
            // 현 시점까지 들어와 있는 요청까지만 처리
            final int NUM_OF_MESSAGES = hidingTeamRequests.size();
            for (int cnt = 0; cnt < NUM_OF_MESSAGES; cnt++) {
                GamePlayerRequest request = hidingTeamRequests.poll();
                Player player = hidingTeam.getPlayerWithId(request.getPlayerId());
                request.handle(player, hidingTeam, this, broadcastService);
            }

            // 봇 플레이어들의 위치 전송
//            for (Player player : hidingTeam.getPlayers().values()) {
//                if (player.isBot()) {
                    // 현재 위치를 기준으로 랜덤하게 옆으로 위치 옮겨주기
//                    player.setX(player.getPos().getX() + 0.0001);
//                    player.setY(player.getPos().getY() + 0.0001);
//                    // 방향 랜덤 지정
//                    player.setDirection(PlayerDirection.values()[(int) (Math.random() * 4)]);
//                    broadcastService.broadcastTo(hidingTeam, new PlayerPositionMessage(new PlayerPosition(player)));
//                }
//            }
        }
    }

    // Bot 들을 현재 위치 기반으로 가장 가까운 숨을 수 있는 HPObjects에 숨김
    private void hideBotPlayers() {
        // 숨기 역할 팀의 봇 플레이어를 가져옴
        List<Player> botPlayers = new ArrayList<>();
        for (Player player : hidingTeam.getPlayers().values()) {
            if (player.isBot()) botPlayers.add(player);
        }

        // 현재 숨을 수 있는 HPObject만 가져옴
        List<HPObject> hpObjects = getEmptyHPObjects();

        // 봇 플레이어들에게 비어있는 가장 가까운 HPObject를 찾아서 숨게 한다.
        for (Player bot : botPlayers) {
            HPObject closestHPObject = findClosestHPObject(bot, hpObjects);
            if (closestHPObject != null) {
                closestHPObject.hidePlayer(bot);
                hpObjects.remove(closestHPObject);
            } else {
                // 봇 하나라도 숨을 수 없는 경우, 나머지 봇도 숨을 수 없음
                break;
            }
        }
    }

    // 현재 비어있는 HPObject만 리스트로 가져옴
    // TODO : 자기장(?)이 생길 경우 그로 인해 숨을 수 없는 곳인지 체크 추가 해야함
    private List<HPObject> getEmptyHPObjects() {
        return gameMap.getHpObjects().values()
                .stream()
                .filter(HPObject::isEmpty)
                .collect(Collectors.toList());
    }

    // 가장 가까운 HPObject 찾기
    private HPObject findClosestHPObject(Player bot, List<HPObject> hpObjects) {
        Pos playerPos = bot.getPos();
        return hpObjects.stream()
                .min(Comparator.comparingDouble(hpObject ->
                        Math.abs(playerPos.getY() - hpObject.getPos().getY()) +
                                Math.abs(playerPos.getX() - hpObject.getPos().getX())))
                .orElse(null);
    }

    // 준비 페이즈 동안 안 숨은 플레이어들을 찾아서 탈락 처리한다.
    private void eliminateUnhidePlayers() {
        Map<String, Player> hidingTeamPlayers = hidingTeam.getPlayers();
        Map<String, HPObject> hpObjects = gameMap.getHpObjects();

        // 안 숨은 플레이어를 찾는 2중 반복문
        for (Player player : hidingTeamPlayers.values()) {
            boolean isHide = false;
            for (HPObject hpObject : hpObjects.values()) {
                if (hpObject.getPlayer() == player) {
                    isHide = true;
                    break;
                }
            }
            // 안 숨었을 경우 탈락 처리
            if (!isHide && !player.isEliminated()) {
                player.eliminate();
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

        // 찾는 팀에게 방향 힌트 제공
        sendDirectionHints();

        // 요청 처리 큐 초기화
        seekingTeamRequests.clear();

        // 제한 시간이 끝날 때까지 루프 반복
        final long TIME_TO_SWITCH = System.currentTimeMillis() + Phase.MAIN.getDuration();
        while (!isTimeToSwitch(TIME_TO_SWITCH) && !isEnd()) {
            // 현 시점까지 들어와 있는 요청까지만 처리
            final int NUM_OF_MESSAGES = seekingTeamRequests.size();
            for (int cnt = 0; cnt < NUM_OF_MESSAGES; cnt++) {
                GamePlayerRequest request = seekingTeamRequests.poll();
                Player player = seekingTeam.getPlayerWithId(request.getPlayerId());
                request.handle(player, seekingTeam, this, broadcastService);
            }

            // 봇 플레이어들의 위치 전송
//            for (Player player : seekingTeam.getPlayers().values()) {
//                if (player.isBot()) {
                    // 현재 위치를 기준으로 랜덤하게 옆으로 위치 옮겨주기
//                    player.setX(player.getPos().getX() + 0.0001);
//                    player.setY(player.getPos().getY() + 0.0001);
//                    player.setDirection(PlayerDirection.values()[(int) (Math.random() * 4)]);
//                    PlayerPositionMessage message = new PlayerPositionMessage(new PlayerPosition(player));
//                    broadcastService.broadcastTo(seekingTeam, message);
//                    broadcastService.broadcastTo(hidingTeam, message);
//                }
//            }
        }
    }

    private void runEndPhase() {
        this.currentPhase = Phase.END;
        log.info("Room {} END Phase start --------------------------------------", room.getRoomNumber());
        broadcastService.broadcastTo(this, new PhaseChangeControlMessage(Phase.END));
    }

    // TODO: 후에 맵의 둘레 부분이 줄어들 경우, 위치를 계산하여 숨은 팀 플레이어들에게 송신
    // 현재는 플레이어가 숨기 전 마지막 위치를 반환한다.
    private void exitPlayers() {
        for (Player player : hidingTeam.getPlayers().values()) {
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

        String team = this.getPlayerTeam(player);

        GameControlMessage message = new GameControlMessage(
                GameControlType.PLAYER_DISCONNECTED,
                Map.of("playerId", player.getId(), "team", team, "roomInfo", RoomMemberInfo.getAllInfoListFrom(this.getRoom()))
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
    private void resetSeekCount() {
        for (Player player : hidingTeam.getPlayers().values()) {
            player.initSeekCount();
        }
    }

    public void checkForVictory() {
        if (hidingTeam.getPlayers().isEmpty() || isTeamEliminated(hidingTeam)) {
            // 찾는 팀의 승리
            endGame(seekingTeam);
        } else if (seekingTeam.getPlayers().isEmpty() || isTeamEliminated(hidingTeam)) {
            // 숨는 팀의 승리
            endGame(hidingTeam);
        }
        // 승패가 결정나지 않았는데 게임 시간이 끝났다면
        // WARNING : endGame 안에서 Phase.FINISHED로 업데이트 되기 때문에
        // 아래 코드는 if가 아니라 else if로 작성된 것이므로 수정 시 고려해야 함
        else if (this.getCurrentPhase() == Phase.FINISHED) {
            // 숨는 팀의 승리
            endGame(hidingTeam);
        }
    }

    // 팀원이 전부 Eliminated되었는지 확인
    private boolean isTeamEliminated(Team team) {
        for (Player player : team.getPlayers().values()) {
            if (!player.isEliminated()) {
                return false;
            }
        }
        return true;
    }

    private void endGame(Team winningTeam) {
        // 승리 팀을 알리고, 게임을 종료하고, 결과를 저장하는 등
        broadcastService.broadcastTo(this, new GameEndMessage());

        // 승패팀을 찾아서 전적을 업데이트 시켜준다.
        Team losingTeam = (winningTeam == hidingTeam) ? seekingTeam : hidingTeam;
        updatePlayerStats(winningTeam, losingTeam);

        // 게임 종료 처리
        this.setGameFinished();
        room.endGame();
    }

    private void updatePlayerStats(Team winningTeam, Team losingTeam) {
        for (Player player : winningTeam.getPlayers().values()) {
            if (!player.isBot())
                updateUserProfile(player, true);
        }
        for (Player player : losingTeam.getPlayers().values()) {
            if (!player.isBot())
                updateUserProfile(player, false);
        }
    }

    private void updateUserProfile(Player player, boolean isWinner) {
        UserProfileEntity userProfile = userService.getUserProfileEntityByUuid(player.getId());
        userProfile.addCatchCount(player.getCatchCount());
        userProfile.addSurvivalTimeInSeconds(player.getSurvivalTimeInSeconds());
        if (isWinner)
            userProfile.addwins();
        else
            userProfile.addLosses();
        userService.updateUserProfileEntity(userProfile);
    }

    public void applyItemToPlayer(String playerId, Item item, Duration duration, String appliedById, String requestId) {
        Player player = getPlayerbyId(playerId);
        Duration durationOfItem = item.getDuration();
        player.applyItem(item, durationOfItem, appliedById);
        broadcastService.broadcastTo(this, new ItemAppliedMessage(
                room.getRoomNumber(),
                playerId,
                item,
                duration,
                player.getSpeed(),
                requestId
        ));
    }

    public void applyItemToHPObject(String objectId, Item item, Duration duration, String appliedById, String requestId) {
        HPObject hpObject = gameMap.getHpObjects().get(objectId);
        Duration durationOfItem = item.getDuration();
        if (hpObject != null) {
            hpObject.applyItem(item, durationOfItem, appliedById);
            broadcastService.broadcastTo(this, new ItemAppliedToHPObjectMessage(
                    room.getRoomNumber(),
                    objectId,
                    hpObject.getPlayer() != null ? hpObject.getPlayer().getId() : null,
                    item,
                    duration,
                    appliedById,
                    requestId
            ));
        } else {
            broadcastService.broadcastTo(this, new ItemApplicationFailedMessage(
                    room.getRoomNumber(),
                    appliedById,
                    objectId,
                    item,
                    requestId
            ));
        }
    }

    private Player getPlayerbyId(String playerId) {
        for (Team team : List.of(hidingTeam, seekingTeam)) {
            Player player = team.getPlayerWithId(playerId);
            if (player != null) return player;
        }
        throw new ResponseException(PLAYER_NOT_IN_ROOM);
    }

    public void notifyItemCleared(Player player) {
        broadcastService.broadcastTo(this, new ItemClearedMessage(
                room.getRoomNumber(),
                player.getId(),
                null,
                Duration.ZERO,
                null
        ));
    }

    public void notifyHPItemCleared(HPObject hpObject) {
        broadcastService.broadcastTo(this, new ItemClearedMessage(
                room.getRoomNumber(),
                null,
                hpObject.getId(),
                Duration.ZERO,
                null
        ));
    }

    public void handleItemUseRequest(ItemUseReq itemUseReq) {
        String playerId = itemUseReq.getPlayerId();
        String targetId = itemUseReq.getTargetId();
        Item item = itemUseReq.getItem();
        String requestId = itemUseReq.getRequestId();
        String roomId = itemUseReq.getRoomId();

        if (item.isApplicableToPlayer()) {
            applyItemToPlayer(targetId, item, item.getDuration(), playerId, requestId);
        } else if (item.isApplicableToHPObject()) {
            applyItemToHPObject(targetId, item, item.getDuration(), playerId, requestId);
        } else {
            throw new ResponseException(ErrorDetail.UNKNOWN_ITEM_OR_PLAYER_NOT_FOUND);
        }
    }

    private void resetAllItems() {
        for (Player player : room.getPlayers().values()) {
            player.clearItem();
        }
        for (HPObject hpObject : gameMap.getHpObjects().values()) {
            hpObject.clearItem();
        }
    }


    // Hider들의 방향을 계산해주는 메소드
    public List<DirectionArrow> getDirectionsOfHiders(Player seeker) {
        List<DirectionArrow> directions = new ArrayList<>();
        for (Player hider : hidingTeam.getPlayers().values()) {
            if (!hider.isEliminated()) {
                DirectionArrow direction = seeker.getDirectionTo(hider);
                if (direction != null) {
                    directions.add(direction);
                }
            }
        }
        return directions;
    }

    // 계산된 hider들의 방향을 seeker에게 전송해주는 메소드
    public void sendDirectionHints() {
        for (Player seeker : seekingTeam.getPlayers().values()) {
            List<DirectionArrow> directions = getDirectionsOfHiders(seeker);
            broadcastService.unicastTo(seeker, new DirectionHintMessage(seeker.getId(), directions));
        }
    }

    // MUSHROOM 아이템 적용 메소드
    public void applyMushroomEffect(Player player) {
        List<DirectionArrow> directions = getDirectionsOfHiders(player);
        broadcastService.unicastTo(player, new DirectionHintMessage(player.getId(), directions));
    }

    public Map<String, List<PlayerStatsResp>> getEndGameStats() {
        List<PlayerStatsResp> racoonTeamStats = new ArrayList<>();
        List<PlayerStatsResp> foxTeamStats = new ArrayList<>();

        for (Player player : room.getPlayers().values()) {
            Team playerTeam = hidingTeam.has(player) ? hidingTeam : seekingTeam;
            PlayerStatsResp playerStats = new PlayerStatsResp(
                    player.getId(),
                    player.getNickname(),
                    player.getCatchCount(),
                    player.getSurvivalTimeInSeconds(),
                    playerTeam.getCharacter().toString()
            );

            if (playerTeam.getCharacter() == Team.Character.RACOON) {
                racoonTeamStats.add(playerStats);
            } else {
                foxTeamStats.add(playerStats);
            }
        }

        Map<String, List<PlayerStatsResp>> sortedStats = new LinkedHashMap<>();
        sortedStats.put("RACOON", racoonTeamStats);
        sortedStats.put("FOX", foxTeamStats);

        return sortedStats;
    }

    private void sendSafeZoneUpdate() {
        List<Integer> corners = gameMap.getSafeZoneCorners();
        broadcastService.broadcastTo(this, new SafeZoneUpdateMessage(corners));
    }

    private void reduceSafeZoneWithElimination() {

        // 맵 축소
        gameMap.reduceSafeArea(TOTAL_ROUND, round);
        // 안전구역 알림
        sendSafeZoneUpdate();

        // 10초 후 안전구역 바깥에 있는 플레이어들 탈락처리 메소드 예약
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.schedule(this::eliminatePlayersOutsideSafeZone, SAFE_ZONE_REDUCE_DURATION, TimeUnit.SECONDS);
    }

    // 안전구역 바깥에 있는 플레이어들 탈락처리
    private void eliminatePlayersOutsideSafeZone() {
        List<Player> allPlayers = new ArrayList<>(room.getPlayers().values());

        for (Player player : allPlayers) {
            if (!gameMap.isInSafeZone(player)) {
                player.eliminateOutOfSafeZone();
                String team = getPlayerTeam(player);
                EliminationOutOfSafeZoneMessage message = new EliminationOutOfSafeZoneMessage(player.getId(), team);
                broadcastService.broadcastTo(this, message);
                broadcastService.unicastTo(player, message);
            }
        }
    }

    public String getPlayerTeam(Player player) {
        if (hidingTeam.has(player)) {
            return hidingTeam.getCharacter() == Team.Character.RACOON ? "RACOON" : "FOX";
        } else if (seekingTeam.has(player)) {
            return seekingTeam.getCharacter() == Team.Character.RACOON ? "RACOON" : "FOX";
        } else {
            throw new ResponseException(PLAYER_NOT_IN_ROOM);
        }
    }

    public void setGameFinished() {
        this.currentPhase = Phase.FINISHED;
    }
}
