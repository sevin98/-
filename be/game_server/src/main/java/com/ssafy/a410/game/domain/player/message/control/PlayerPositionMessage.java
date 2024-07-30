package com.ssafy.a410.game.domain.player.message.control;

import com.ssafy.a410.game.domain.player.message.request.PlayerPositionInfo;

public class PlayerPositionMessage extends PlayerControlMessage {
    public PlayerPositionMessage(PlayerPositionInfo playerPositionInfo) {
        super(PlayerControlType.INIT_POSITION, playerPositionInfo);
    }
}
