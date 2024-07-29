package com.ssafy.a410.socket.handler;

import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.game.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class RoomSubscriptionHandler extends SocketSubscriptionHandler {
    private static final String DESTINATION_PATTERN = "/topic/rooms/[a-zA-Z0-9]+";

    private final RoomService roomService;
    private final UserService userService;

    @Override
    public boolean isTarget(String destination) {
        return destination.matches(DESTINATION_PATTERN);
    }

    @Async
    @Override
    public void handle(String destination, String clientId) {
    }

    @Override
    public boolean hasPermission(String destination, String token) {
        String roomId = destination.substring(destination.lastIndexOf("/") + 1);
        return roomService.findRoomById(roomId)
                .map(room -> room.isCorrectSubscriptionToken(token))
                .orElse(false);
    }
}
