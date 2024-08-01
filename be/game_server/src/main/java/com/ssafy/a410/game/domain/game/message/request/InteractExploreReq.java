package com.ssafy.a410.game.domain.game.message.request;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.GameMap;
import com.ssafy.a410.game.domain.game.HPObject;
import com.ssafy.a410.game.domain.game.message.control.interact.InteractExploreMessage;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

import static com.ssafy.a410.game.domain.player.message.request.GamePlayerRequestType.INTERACT_EXPLORE;

public class InteractExploreReq extends InteractReq {


    private final String objectId;

    @Getter
    @Setter
    private String roomId;
    @Getter
    @Setter
    private String playerId;

    public InteractExploreReq(String playerId, String objectId) {
        super(playerId, INTERACT_EXPLORE, null);
        this.objectId = objectId;
    }

    @Override
    public void handle(Player requestedPlayer, Team senderTeam, Game game, MessageBroadcastService broadcastService) {
        GameMap gameMap = game.getGameMap();
        Map<String, HPObject> hpObjects = gameMap.getHpObjects();
        HPObject hpObject = hpObjects.get(objectId);

        if (hpObject.explore(requestedPlayer))
            handleSuccess(hpObject, requestedPlayer, game, broadcastService);
        else
            handleFailure(hpObject, requestedPlayer, game, broadcastService);
    }

    private void handleSuccess(HPObject hpObject, Player requestedPlayer, Game game, MessageBroadcastService broadcastService) {
        Player foundPlayer = hpObject.extractHidingPlayer();
        game.eliminate(foundPlayer);

        InteractExploreMessage message = InteractExploreMessage.successMessage(
                roomId,
                requestedPlayer.getId(),
                objectId,
                foundPlayer.getId()
        );
        broadcastService.broadcastTo(game, message);
    }

    private void handleFailure(HPObject hpObject, Player requestedPlayer, Game game, MessageBroadcastService broadcastService) {
        hpObject.extractItem();

        //TODO: 추후 아이템 적용 로직추가

        InteractExploreMessage message = InteractExploreMessage.failureMessage(
                roomId,
                requestedPlayer.getId(),
                objectId
        );
        broadcastService.broadcastTo(game, message);
    }
}
