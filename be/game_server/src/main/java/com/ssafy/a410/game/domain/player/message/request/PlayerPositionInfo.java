package com.ssafy.a410.game.domain.player.message.request;

import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.player.PlayerDirection;

public record PlayerPositionInfo(
        String playerId,
        double x,
        double y,
        PlayerDirection direction
) {
    public PlayerPositionInfo(Player player) {
        this(player.getId(), player.getPos().getX(), player.getPos().getY(), player.getDirection());
    }
}
