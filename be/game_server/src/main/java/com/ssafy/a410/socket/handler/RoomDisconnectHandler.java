package com.ssafy.a410.socket.handler;

import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoomDisconnectHandler {

    private final RoomService roomService;

    public void handleDisconnect(String playerId) {
        roomService.findRoomByPlayerId(playerId).ifPresent(room -> {
            Player player = room.getPlayerWith(playerId);
            room.kick(player);

          if(room.getPlayers().isEmpty())
              roomService.removeRoom(room.getRoomNumber());
          else
              room.notifyDisconnection(player);
        });
    }
}
