package com.ssafy.a410.game.domain;

import com.ssafy.a410.common.exception.handler.GameException;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

public class Team {
    private static final int MAX_NUM_OF_PLAYERS = 4;
    @Getter
    private final Character character;
    private final Map<String, Player> players;

    public Team(Character character) {
        this.character = character;
        this.players = new HashMap<>();
    }

    public void addPlayer(Player player) {
        if (this.isFull()) {
            throw new GameException("Team is full");
        }
        players.put(player.getId(), player);
    }

    public void removePlayer(Player player) {
        if (!this.has(player)) {
            throw new GameException("Player is not in team");
        }
        players.remove(player.getId());
    }

    public boolean isFull() {
        return players.size() >= MAX_NUM_OF_PLAYERS;
    }

    public boolean has(Player player) {
        return players.containsKey(player.getId());
    }

    enum Character {
        RACOON, FOX
    }
}
