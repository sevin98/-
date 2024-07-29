package com.ssafy.a410.socket.handler;

import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class PlayerSubscriptionHandler extends SocketSubscriptionHandler {
    private static final String DESTINATION_PATTERN = "/topic/rooms/.+/players/.+";

    private final RoomService roomService;

    @Override
    public boolean isTarget(String destination) {
        return destination.matches(DESTINATION_PATTERN);
    }

    @Override
    public void handle(String destination, String clientId) {

    }

    @Override
    public boolean hasPermission(String destination, String token) {
        String roomId = destination.split("/")[3];
        Room room = roomService.getRoomById(roomId);

        String playerId = destination.split("/")[5];
        Player player = room.getPlayerWith(playerId);
        return player.isCorrectSubscriptionToken(token);
    }
}
