package com.ssafy.a410.game.service;

import com.ssafy.a410.model.GameState;
import com.ssafy.a410.model.Player;

public interface GameService {
    GameState joinGame(Player player);
    GameState leaveGame(Player player);
    GameState readyPlayer(Player player);
    GameState updateGameState(GameState gameState);
}
