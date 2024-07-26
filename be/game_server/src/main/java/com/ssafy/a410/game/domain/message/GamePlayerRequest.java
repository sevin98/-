package com.ssafy.a410.game.domain.message;

public record GamePlayerRequest(
        String playerId,
        GamePlayerRequestType type,
        Object data
) {
}
