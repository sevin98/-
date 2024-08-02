package com.ssafy.a410.game.domain.player.message.request;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.player.PlayerDirection;
import com.ssafy.a410.game.domain.player.PlayerPosition;
import com.ssafy.a410.game.domain.player.message.control.PlayerPositionMessage;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;

import static com.ssafy.a410.game.domain.player.message.request.GamePlayerRequestType.MOVEMENT_SHARE;

public class PlayerPositionShareRequest extends GamePlayerRequest {
    public PlayerPositionShareRequest(String playerId, PlayerPosition position) {
        super(playerId, MOVEMENT_SHARE, position);
    }

    @Override
    public void handle(Player sender, Team senderTeam, Game game, MessageBroadcastService broadcastService) {
        // 위치 적용
        sender.setX(((PlayerPosition) getData()).x());
        sender.setY(((PlayerPosition) getData()).y());
        sender.setDirection(PlayerDirection.valueOf(((PlayerPosition) getData()).direction()));

        // 같은 팀에 위치 공유
        PlayerPositionMessage message = new PlayerPositionMessage((PlayerPosition) getData());
        broadcastService.broadcastTo(senderTeam, message);
    }
}