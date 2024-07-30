package com.ssafy.a410.game.domain.player.message.request;

import com.ssafy.a410.game.domain.player.PlayerPosition;

import static com.ssafy.a410.game.domain.player.message.request.GamePlayerRequestType.MOVEMENT_SHARE;

public class PlayerPositionShareRequest extends GamePlayerRequest {
    public PlayerPositionShareRequest(String playerId, PlayerPosition position) {
        super(playerId, MOVEMENT_SHARE, position);
    }
}
