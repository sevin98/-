package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.Game;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Team;

public interface GameBroadcastService {
    void broadcastTo(Game game, Object message);

    void broadcastTo(Team team, Object message);

    void unicastTo(Player player, Object message);
}
