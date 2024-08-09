package com.ssafy.a410.game.domain.game.message.control;

public class GameEndMessage extends GameControlMessage {
    public GameEndMessage() {
        super(GameControlType.GAME_END, null);
    }
}
