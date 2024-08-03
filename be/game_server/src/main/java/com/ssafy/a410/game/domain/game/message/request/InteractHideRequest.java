package com.ssafy.a410.game.domain.game.message.request;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.message.control.InteractHideMessage;
import com.ssafy.a410.game.domain.game.message.control.InteractType;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;

import static com.ssafy.a410.game.domain.player.message.request.GamePlayerRequestType.INTERACT_HIDE;

public class InteractHideRequest extends InteractReq {

    public InteractHideRequest(String playerId, String objectId) {
        super(playerId, INTERACT_HIDE, null);
    }

    @Override
    public void handle(Player requestedPlayer, Team senderTeam, Game game, MessageBroadcastService broadcastService) {
        InteractHideMessage message = new InteractHideMessage(InteractType.INTERACT_HIDE, null);
        broadcastService.broadcastTo(game, message);
    }
}