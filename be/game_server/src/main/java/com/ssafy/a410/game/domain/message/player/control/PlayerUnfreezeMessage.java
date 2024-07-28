package com.ssafy.a410.game.domain.message.player.control;

public class PlayerUnfreezeMessage extends PlayerControlMessage {
    public PlayerUnfreezeMessage() {
        super(PlayerControlType.UNFREEZE, null);
    }
}
