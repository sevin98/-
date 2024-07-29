package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.Game;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.domain.Team;

/**
 * 게임 관련 메시지를 전달하는 서비스
 */
public interface GameBroadcastService {
    void broadcastTo(Room room, Object message);

    void broadcastTo(Game game, Object message);

    void broadcastTo(Team team, Object message);

    void unicastTo(Player player, Object message);
}
