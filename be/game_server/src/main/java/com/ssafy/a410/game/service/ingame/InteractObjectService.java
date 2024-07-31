package com.ssafy.a410.game.service.ingame;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.message.request.InteractHideReq;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.service.InteractService;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InteractObjectService implements InteractService {

    private final RoomService roomService;

    @Override
    public void hideOnHPObject(String roomId, String playerId, String objectId) {
        Room room = roomService.getRoomById(roomId);
        Player player = room.getPlayerWith(playerId);
        Game playingGame = room.playingGame;

        InteractHideReq request = new InteractHideReq(playerId, objectId);
        playingGame.pushMessage(player, request);
    }
}
