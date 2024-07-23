package com.ssafy.a410.game.domain;

import com.ssafy.a410.common.exception.handler.GameException;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Getter
public class Room {
    // 한 방에 참가할 수 있는 최대 플레이어 수
    private static final int NUM_OF_MAX_PLAYERS = 8;

    private final String id;
    private final Map<String, Player> players;
    @Setter
    private Game playingGame;

    public Room(String id) {
        this.id = id;
        players = new ConcurrentHashMap<>();
    }

    public void addPlayer(Player player) {
        if (!canJoin(player)) {
            throw new GameException("Cannot join to room");
        } else {
            players.put(player.getId(), player);
        }
    }

    public void removePlayer(Player player) {
        players.remove(player.getId());
    }

    private boolean isFull() {
        return players.size() >= NUM_OF_MAX_PLAYERS;
    }

    public boolean isIn(Player player) {
        return players.containsKey(player.getId());
    }

    public boolean canJoin(Player player) {
        // 방에 사람이 더 들어올 수 있고, 게임이 시작되지 않아야 함
        return !isFull() && playingGame == null && !isIn(player);
    }
}
