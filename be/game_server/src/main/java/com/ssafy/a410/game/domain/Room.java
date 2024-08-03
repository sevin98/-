package com.ssafy.a410.game.domain;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Getter
public class Room implements Subscribable {
    // 한 방에 참가할 수 있는 최대 플레이어 수
    private static final int NUM_OF_MAX_PLAYERS = 8;

    // 방 참여 코드 (고유값)
    private final String roomNumber;
    // 방 비밀 번호
    private final String password;

    private final Map<String, Player> players;
    @Setter
    public Game playingGame;

    public Room(String roomNumber, String password) {
        this.roomNumber = roomNumber;
        this.password = password;
        players = new ConcurrentHashMap<>();
    }

    // 방에 사용자를 추가하여 플레이어를 반환한다.
    public synchronized Player join(UserProfile userProfile) {
        if (!canJoin(userProfile)) {
            throw new GameException("Player cannot join to room");
        } else {
            Player player = new Player(userProfile, this);
            players.put(player.getId(), player);
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
        return playingGame != null;
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
        return !(isFull() || hasPlayingGame() || hasPlayerWith(userProfile.getUuid()));
    }

    // 방에 플레이어가 있는지 확인
    public boolean has(Player player) {
        return players.containsKey(player.getId());
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

    // 주어진 비밀번호로 인증할 수 있는지 확인
    public boolean isAuthenticatedWith(String password) {
        return isPublic() || this.password.equals(password);
    }

    @Override
    public String getTopic() {
        return "/topic/rooms/" + roomNumber;
    }
}
