package com.ssafy.a410.game.domain.message.player.control;

public class PlayerFreezeMessage extends PlayerControlMessage {
    public PlayerFreezeMessage() {
        super(PlayerControlType.FREEZE, null);
    }
}
