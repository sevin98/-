package com.ssafy.a410.game.domain.player.message.control;

import com.ssafy.a410.game.domain.player.message.request.PlayerPositionInfo;
import com.ssafy.a410.game.domain.team.Team;

import java.util.Map;

public class PlayerInitializeMessage extends PlayerControlMessage {
    public PlayerInitializeMessage(Team.Character teamCharacter, PlayerPositionInfo playerPositionInfo) {
        super(PlayerControlType.INITIALIZE_PLAYER, Map.of("teamCharacter", teamCharacter, "playerPositionInfo", playerPositionInfo));
    }
}
