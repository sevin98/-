package com.ssafy.a410.game.domain.player.message.request;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 플레이어로부터 서버에 도달한 비동기 요청 메시지
 */
@Getter
@RequiredArgsConstructor
public abstract class GamePlayerRequest {
    private final String playerId;
    private final GamePlayerRequestType type;
    private final Object data;

    public abstract void handle(Player requestedPlayer, Team senderTeam, Game game, MessageBroadcastService broadcastService);
}
