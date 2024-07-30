package com.ssafy.a410.game.domain.player.message.request;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 플레이어로부터 서버에 도달한 비동기 요청 메시지
 */
@Getter
@RequiredArgsConstructor
public class GamePlayerRequest {
    private final String playerId;
    private final GamePlayerRequestType type;
    private final Object data;
}
