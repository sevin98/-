package com.ssafy.a410.socket.handler;

import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class GameSubscriptionHandler extends SocketSubscriptionHandler {
    private static final String DESTINATION_PATTERN = "/topic/rooms/[a-zA-Z0-9]+/game";

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
        String roomId = getRoomIdFrom(destination);
        Room room = roomService.findRoomById(roomId).orElseThrow(() -> new GameException("Room not found"));
        Game game = room.getPlayingGame();
        return game != null && game.isCorrectSubscriptionToken(token);
    }

    private String getRoomIdFrom(String destination) {
        return destination.split("/")[3];
    }
}
