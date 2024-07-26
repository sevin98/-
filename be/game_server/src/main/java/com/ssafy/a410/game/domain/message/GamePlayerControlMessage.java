package com.ssafy.a410.game.domain.message;

import lombok.Getter;

@Getter
public class GamePlayerControlMessage extends ServerMessage {
    private final GamePlayerControlType type;

    public GamePlayerControlMessage(GamePlayerControlType type, Object data) {
        super(data);
        this.type = type;
    }
}
