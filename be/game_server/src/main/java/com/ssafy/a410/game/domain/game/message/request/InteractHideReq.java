package com.ssafy.a410.game.domain.game.message.request;

import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.GameMap;
import com.ssafy.a410.game.domain.game.HPObject;
import com.ssafy.a410.game.domain.game.message.control.interact.InteractHideMessage;
import com.ssafy.a410.game.domain.game.message.control.interact.InteractType;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;

import java.util.Map;

import static com.ssafy.a410.common.exception.ErrorDetail.HP_OBJECT_ALREADY_OCCUPIED;
import static com.ssafy.a410.common.exception.ErrorDetail.HP_OBJECT_NOT_FOUND;
import static com.ssafy.a410.game.domain.player.message.request.GamePlayerRequestType.INTERACT_HIDE;

public class InteractHideReq extends InteractReq {

    private final String objectId;

    public InteractHideReq(String playerId, String objectId) {
        super(playerId, INTERACT_HIDE, null);
        this.objectId = objectId;
    }

    @Override
    public void handle(Player requestedPlayer, Team senderTeam, Game game, MessageBroadcastService broadcastService) {
        GameMap gameMap = game.getGameMap();
        Map<String, HPObject> hpObjects = gameMap.getHpObjects();
        HPObject hpObject = hpObjects.get(objectId);

        // 유효하지 않은 오브젝트 ID인 경우 예외 발생
        if (hpObject == null)
            throw new ResponseException(HP_OBJECT_NOT_FOUND);

        // 오브젝트가 이미 점유된 경우 예외 발생
        if (!hpObject.isEmpty())
            throw new ResponseException(HP_OBJECT_ALREADY_OCCUPIED);
        hpObject.hidePlayer(requestedPlayer);

        InteractHideMessage message = new InteractHideMessage(InteractType.INTERACT_HIDE, null);
        broadcastService.broadcastTo(game, message);
    }
}
