package com.ssafy.a410.socket.handler;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.service.GameService;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DisconnectHandler {

    private final RoomService roomService;
    private final GameService gameService;

    public void disconnectAll(String playerId) {
        // 아래 순서는 반드시 지켜져야 함!
        this.gameHandleDisconnect(playerId);
        this.handleDisconnect(playerId);
    }

    public void handleDisconnect(String playerId) {
        Room room = roomService.getRoomHasDisconnectedPlayerInfoWithId(playerId);
        if (room == null) {
            room = roomService.findRoomByPlayerId(playerId)
                    .orElseThrow(() -> new RuntimeException("Player not in room"));
            room.kick(room.getPlayerWith(playerId));
        }

        room.notifyDisconnection(room.getDisconnectedPlayerInfo(playerId));
        if (room.getPlayers().isEmpty())
            roomService.removeRoom(room.getRoomNumber());
    }

    public void gameHandleDisconnect(String playerId) {
        Room room = roomService.getRoomHasDisconnectedPlayerInfoWithId(playerId);
        if (room == null || room.getPlayingGame() == null) {
            return;
        }

        Game game = room.getPlayingGame();
        Player player = game.getRoom().getPlayerWith(playerId);

        game.notifyDisconnection(player);
        game.checkForVictory();
    }
}
