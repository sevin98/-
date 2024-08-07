package com.ssafy.a410.game.domain.game.message;

import com.ssafy.a410.game.domain.game.message.control.GameControlMessage;
import com.ssafy.a410.game.domain.game.message.control.GameControlType;
import lombok.Getter;

import java.util.Map;

@Getter
public class EliminationMessage extends GameControlMessage {
    public EliminationMessage(String playerId) {
        super(GameControlType.ELIMINATION, Map.of("playerId", playerId));
    }
}
