package com.ssafy.a410.game.domain.team;

import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

public class Team extends Subscribable {
    private static final int MAX_NUM_OF_PLAYERS = 4;
    @Getter
    private final Character character;
    private final Game game;
    @Getter
    private final Map<String, Player> players;

    public Team(Character character, Game game) {
        this.character = character;
        this.game = game;
        this.players = new HashMap<>();
    }

    public boolean isEmpty() {
        return players.isEmpty();
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

    public void clearPlayers() {
        players.clear();
    }

    public boolean isFull() {
        return players.size() >= MAX_NUM_OF_PLAYERS;
    }

    public boolean has(Player player) {
        return players.containsKey(player.getId());
    }

    public void freezePlayers() {
        players.values().forEach(Player::freeze);
    }

    public void unfreezePlayers() {
        players.values().forEach(Player::unfreeze);
    }

    @Override
    public String getTopic() {
        String roomNumber = game.getRoom().getRoomNumber();
        String teamCode = this.character.name().toLowerCase();
        return String.format("/topic/rooms/%s/game/teams/%s", roomNumber, teamCode);
    }

    public enum Character {
        RACOON, FOX
    }
}
