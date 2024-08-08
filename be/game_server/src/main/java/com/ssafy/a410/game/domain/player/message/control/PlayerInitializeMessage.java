package com.ssafy.a410.game.domain.player.message.control;

import com.ssafy.a410.game.domain.player.PlayerPosition;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.socket.controller.dto.SubscriptionInfoResp;

import java.util.Map;

public class PlayerInitializeMessage extends PlayerControlMessage {
    public PlayerInitializeMessage(PlayerPosition playerPosition, Team team) {
        super(PlayerControlType.INITIALIZE_PLAYER, Map.of("teamCharacter", team.getCharacter(), "playerPositionInfo", playerPosition, "teamSubscriptionInfo", new SubscriptionInfoResp(team)));
    }
}
