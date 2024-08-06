package com.ssafy.a410.game.domain.game.message;

import com.ssafy.a410.common.domain.message.ControlMessage;
import com.ssafy.a410.game.domain.game.message.control.GameControlMessage;
import com.ssafy.a410.game.domain.player.DirectionArrow;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
public class DirectionHintMessage extends ControlMessage {
    private final String playerId;
    private final List<DirectionArrow> directions;

    public DirectionHintMessage(String playerId, List<DirectionArrow> directions) {
        super("DirectionHint", Map.of("playerId", playerId, "directions", directions), null);
        this.playerId = playerId;
        this.directions = directions;
    }
}
