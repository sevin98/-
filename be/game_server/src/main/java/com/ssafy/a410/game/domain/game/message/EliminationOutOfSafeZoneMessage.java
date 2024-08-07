package com.ssafy.a410.game.domain.game.message;

import com.ssafy.a410.game.domain.game.message.control.GameControlMessage;
import com.ssafy.a410.game.domain.game.message.control.GameControlType;

public class EliminationOutOfSafeZoneMessage extends GameControlMessage {
    private final String playerId;

    public EliminationOutOfSafeZoneMessage(String playerId) {
        super(GameControlType.ELIMINATION_OUT_OF_SAFE_ZONE, null);
        this.playerId = playerId;
    }
}

