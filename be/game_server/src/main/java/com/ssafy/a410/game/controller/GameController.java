package com.ssafy.a410.game.controller;

import com.ssafy.a410.common.controller.dto.SocketClientRequestVO;
import com.ssafy.a410.game.controller.dto.PlayerPositionVO;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.service.PlayerBroadcastService;
import com.ssafy.a410.game.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

@Slf4j
@RequiredArgsConstructor
@Controller
public class GameController {
    private final PlayerBroadcastService playerBroadcastService;
    private final RoomService roomService;

    @MessageMapping("/rooms/{roomId}/players/position")
    public void handlePlayerPosition(@Validated @Payload SocketClientRequestVO<PlayerPositionVO> vo, @DestinationVariable String roomId) {
        log.info("Player {} shared position: {}", vo.getRequestId(), vo.getData());
        playerBroadcastService.broadcastPlayerPosition(roomId, vo.getData(), vo.getRequestId());
    }

    @MessageMapping("/rooms/join")
    @SendTo("/topic/game")
    public void join(Player player) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @MessageMapping("/leave")
    @SendTo("/topic/game")
    public void leave(Player player) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @MessageMapping("/ready")
    @SendTo("/topic/game")
    public void ready(Player player) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
