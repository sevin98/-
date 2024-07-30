package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.Game;

import java.util.Optional;

public interface GameService {
    Optional<Game> findGameByPlayerId(String playerId);
}
