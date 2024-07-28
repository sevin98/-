package com.ssafy.a410.game.domain.message.game.control;

public class GameStartMessage extends GameControlMessage {
    public GameStartMessage() {
        super(GameControlType.GAME_START, null);
    }
}
