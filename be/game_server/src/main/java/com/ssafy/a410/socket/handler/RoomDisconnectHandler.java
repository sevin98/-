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

    public void gameHandleDisconnect(String playerId) {
        roomService.findRoomByPlayerId(playerId).
        gameService.findGameByPlayerid(playerId).ifPresent(game -> {
            Player player = game.getPlayerWith(playerId);
            game.kick(player);

            if(game.getPlayers().isEmpty())
                gameService.removeGame(game.getGameNumber());
            else
                game.notifyDisconnection(player);
        });
    }
}
