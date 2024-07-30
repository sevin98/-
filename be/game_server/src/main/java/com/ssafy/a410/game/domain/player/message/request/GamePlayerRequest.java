package com.ssafy.a410.game.domain.player.message.request;

/**
 * 플레이어로부터 서버에 도달한 비동기 요청 메시지
 */
public record GamePlayerRequest(
        String playerId,
        GamePlayerRequestType type,
        Object data
) {
}
