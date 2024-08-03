package com.ssafy.a410.socket.interceptor;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.common.service.JWTService;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.service.RoomService;
import com.ssafy.a410.socket.handler.SocketSubscriptionHandler;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Service
@Component
public class RoomSubscriptionHandler extends SocketSubscriptionHandler {
    private static final String DESTINATION_PREFIX = "/topic/rooms/";

    private final RoomService roomService;
    private final UserService userService;

    public RoomSubscriptionHandler(JWTService jwtService, RoomService roomService, UserService userService) {
        super(jwtService);
        this.roomService = roomService;
        this.userService = userService;
    }

    @Override
    public boolean isTarget(String destination) {
        return destination.startsWith(DESTINATION_PREFIX);
    }

    @Async
    @Override
    public void handle(String destination, String clientId) {
        String roomId = destination.substring(DESTINATION_PREFIX.length());
        Room room = roomService.findRoomById(roomId)
                .orElseThrow(() -> new GameException("Trying to join non-existing room."));
        UserProfile userProfile = userService.getUserProfileByUuid(clientId);
        roomService.joinRoom(room, userProfile);
    }
}
