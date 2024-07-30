package com.ssafy.a410.socket.handler;

import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.service.GameService;
import com.ssafy.a410.game.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DisconnectHandler {

    private final RoomService roomService;
    private final GameService gameService;

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
        gameService.findGameByPlayerId(playerId).ifPresent(game -> {
            Player player = game.getRoom().getPlayerWith(playerId);
            game.kick(player);

            if (game.getRoom().getPlayers().isEmpty()){
                gameService.removeGame(game);
            }
            else
                game.notifyDisconnection(player);
        });
    }
}
