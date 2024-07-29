package com.ssafy.a410.game.domain;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.common.constant.MilliSecOf;
import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.game.controller.dto.SubscriptionInfoDTO;
import com.ssafy.a410.game.domain.message.room.control.GameStartInfo;
import com.ssafy.a410.game.domain.message.room.control.PlayerInfo;
import com.ssafy.a410.game.domain.message.room.control.RoomControlMessage;
import com.ssafy.a410.game.domain.message.room.control.RoomControlType;
import com.ssafy.a410.game.service.GameBroadcastService;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Getter
public class Room extends Subscribable {
    // 한 방에 참가할 수 있는 최대 플레이어 수
    private static final int NUM_OF_MAX_PLAYERS = 8;

    // 방 참여 코드 (고유값)
    private final String roomNumber;
    // 방 비밀 번호
    private final String password;
    private final GameBroadcastService broadcastService;
    private final Map<String, Player> players;
    @Setter
    public Game playingGame;

    public Room(String roomNumber, String password, GameBroadcastService broadcastService) {
        this.roomNumber = roomNumber;
        this.password = password;
        this.broadcastService = broadcastService;
        players = new ConcurrentHashMap<>();
    }

    /**
     * 방에 사용자를 추가하여 방에서 활동하게 될 플레이어의 정보를 반환한다.
     * @param userProfile 사용자 정보
     * @return 방에 참여한 플레이어
     */
    public synchronized Player join(UserProfile userProfile) {
        if (!canJoin(userProfile)) {
            throw new GameException("Player cannot join to room");
        } else {
            // 방에 새 플레이어를 추가하고
            Player player = new Player(userProfile, this);
            players.put(player.getId(), player);

            // 방에 참여한 플레이어들에게 방에 참여한 사용자들의 정보를 전달
            log.debug("플레이어 [{}]가 방 {}에 참여했습니다.", player.getNickname(), roomNumber);
            RoomControlMessage message = new RoomControlMessage(
                    RoomControlType.PLAYER_JOIN,
                    PlayerInfo.getAllInfoListFrom(this)
            );
            broadcastService.broadcastTo(this, message);

            return player;
        }
    }

    // 방에서 사용자를 제거한다.
    public synchronized void kick(Player player) {
        if (!has(player)) {
            throw new GameException("Player is not in room");
        } else {
            players.remove(player.getId());
        }
    }

    // 현재 실행 중인 게임이 있는지 확인
    public boolean hasPlayingGame() {
        synchronized (this) {
            return playingGame != null;
        }
    }

    // 공개된 방인지 확인
    public boolean isPublic() {
        return password == null || password.isEmpty();
    }

    // 방이 가득 찼는지 확인
    protected boolean isFull() {
        return players.size() >= NUM_OF_MAX_PLAYERS;
    }

    // 사용자가 방에 참가할 수 있는지 확인
    public boolean canJoin(UserProfile userProfile) {
        synchronized (this) {
            return !(isFull() || hasPlayingGame() || hasPlayerWith(userProfile.getUuid()));
        }
    }

    // 방에 플레이어가 있는지 확인
    public boolean has(Player player) {
        return players.containsKey(player.getId());
    }

    // 해당 방에 참가하고 있는, 주어진 id를 가지는 플레이어를 반환
    public Player getPlayerWith(String playerId) {
        Player found = players.get(playerId);
        if (found == null) {
            throw new GameException("Player not found in room");
        }
        return found;
    }

    // 방에 주어진 id를 가지는 사용자가 있는지 확인
    public boolean hasPlayerWith(String playerId) {
        return players.containsKey(playerId);
    }

    // 게임을 시작할 준비가 되었는지 확인
    public boolean isReadyToStartGame() {
        // 참가한 인원의 과반수 이상이 레디 상태여야 함
        long readyCount = players.values().stream().filter(Player::isReadyToStart).count();
        return readyCount > players.size() / 2;
    }

    // 게임 시작
    @Async
    public void startGame(GameBroadcastService broadcastService) {
        synchronized (this) {
            playingGame = new Game(this, broadcastService);

            // 게임 메시지 구독 명령
            final long STARTS_AFTER = 5L * MilliSecOf.SECONDS;
            RoomControlMessage message = new RoomControlMessage(
                    RoomControlType.SUBSCRIBE_GAME,
                    new GameStartInfo(new SubscriptionInfoDTO(playingGame), STARTS_AFTER)
            );
            broadcastService.broadcastTo(this, message);

            // STARTS_IN만큼 지난 후 게임 시작
            try {
                log.debug("방 {}의 게임이 {}ms 뒤에 시작됩니다.", roomNumber, STARTS_AFTER);
                wait(STARTS_AFTER);
            } catch (InterruptedException e) {
                throw new GameException("Game start interrupted");
            }

            log.info("방 {}의 게임이 시작되었습니다.", roomNumber);
            Thread gameThread = new Thread(playingGame);
            gameThread.start();
        }
    }

    // 주어진 비밀번호로 인증할 수 있는지 확인
    public boolean isAuthenticatedWith(String password) {
        return isPublic() || this.password.equals(password);
    }

    @Override
    public String getTopic() {
        return "/topic/rooms/" + roomNumber;
    }

    public void notifyDisconnection(Player player) {
        RoomControlMessage message = new RoomControlMessage(

                RoomControlType.PLAYER_DISCONNECTED,
                PlayerInfo.getAllInfoListFrom(this)
        );
        broadcastService.broadcastTo(this, message);
    }
}
