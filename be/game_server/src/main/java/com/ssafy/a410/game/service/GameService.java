package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.game.Game;

import java.util.Optional;

public interface GameService {
    Optional<Game> findGameByPlayerId(String playerId);

    void sendGameInfoToPlayer(String roomId, String name);
}
