package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.GameState;
import com.ssafy.a410.game.domain.Player;

// 방의 운영
public interface RoomService {
    GameState joinGame(Player player);

    GameState leaveGame(Player player);

    GameState readyPlayer(Player player);
}
