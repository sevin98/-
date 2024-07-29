package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.Game;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;

import java.util.Optional;

public interface GameService {
    Optional<Game> findGameByPlayerId(String playerId);
    void removeGame(Room room);
    void notifyDisconnection(Player player);
}
