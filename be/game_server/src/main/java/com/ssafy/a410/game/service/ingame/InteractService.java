package com.ssafy.a410.game.service.ingame;

import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.GameMap;
import com.ssafy.a410.game.domain.game.HPObject;
import com.ssafy.a410.game.domain.game.message.request.InteractHideRequest;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.service.InGameService;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

import static com.ssafy.a410.common.exception.ErrorDetail.HP_OBJECT_ALREADY_OCCUPIED;
import static com.ssafy.a410.common.exception.ErrorDetail.HP_OBJECT_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class InteractService implements InGameService {

    private final RoomService roomService;

    private static HPObject getHpObject(String objectId, Game playingGame) {
        GameMap gameMap = playingGame.getGameMap();

        // 게임 맵에서 모든 HP 오브젝트를 가져옴
        Map<String, HPObject> hpObjects = gameMap.getHpObjects();
        // 상호작용할 HP 오브젝트를 가져옴
        HPObject hpObject = hpObjects.get(objectId);

        // 유효하지 않은 오브젝트 ID인 경우 예외 발생
        if (hpObject == null)
            throw new ResponseException(HP_OBJECT_NOT_FOUND);

        // 오브젝트가 이미 점유된 경우 예외 발생
        if (!hpObject.isEmpty())
            throw new ResponseException(HP_OBJECT_ALREADY_OCCUPIED);
        return hpObject;
    }

    @Override
    public void HideOnHPObject(String roomId, String playerId, String objectId) {
        // roomId를 통해 Room 객체를 가져옴
        Room room = roomService.getRoomById(roomId);
        // room에서 playerId를 통해 Player 객체를 가져옴
        Player player = room.getPlayerWith(playerId);

        Game playingGame = room.getPlayingGame();
        HPObject hpObject = getHpObject(objectId, playingGame);

        // HP 오브젝트에 플레이어를 숨김
        hpObject.hidePlayer(player);

        // 상호작용 요청 메시지를 생성하고 게임에 푸시하여 처리함
        InteractHideRequest request = new InteractHideRequest(playerId, objectId);
        playingGame.pushMessage(player, request);
    }
}
