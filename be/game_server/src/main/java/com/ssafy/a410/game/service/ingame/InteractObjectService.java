package com.ssafy.a410.game.service.ingame;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.message.request.InteractSeekReq;
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
    public void hideOnHPObject(InteractHideReq interactHideReq) {
        Room room = roomService.getRoomById(interactHideReq.getRoomId());
        Player player = room.getPlayerWith(interactHideReq.getPlayerId());
        Game playingGame = room.playingGame;

        playingGame.pushMessage(player, interactHideReq);
    }

    @Override
    public void seekObject(InteractSeekReq interactSeekReq){
        Room room = roomService.getRoomById(interactSeekReq.getRoomId());
        Game playingGame = room.playingGame;
        Player requestedPlayer = room.getPlayerWith(interactSeekReq.getPlayerId());

        playingGame.pushMessage(requestedPlayer, interactSeekReq);
    }
}
