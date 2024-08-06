package com.ssafy.a410.game.domain.game.message;

import com.ssafy.a410.game.domain.game.message.control.GameControlMessage;
import com.ssafy.a410.game.domain.game.message.control.GameControlType;
import lombok.Getter;

@Getter
public class EliminationMessage extends GameControlMessage {
    private final String playerId;

    public EliminationMessage(String playerId) {
        super(GameControlType.ELIMINATION, null);
        this.playerId = playerId;
    }
}
