package com.ssafy.a410.game.controller;

import com.ssafy.a410.common.controller.dto.SocketClientRequestVO;
import com.ssafy.a410.game.service.PlayerBroadcastService;
import com.ssafy.a410.game.service.dto.PlayerPositionVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

@Slf4j
@RequiredArgsConstructor
@Controller
public class GameController {
    private final PlayerBroadcastService playerBroadcastService;

    // 현재 참가하고 있는 방에 자신의 현재 위치를 알린다.
    @MessageMapping("/rooms/{roomId}/players/position")
    public void handlePlayerPosition(@Validated @Payload SocketClientRequestVO<PlayerPositionVO> vo, @DestinationVariable String roomId) {
        log.info("Player {} shared position: {}", vo.getRequestId(), vo.getData());
        playerBroadcastService.broadcastPlayerPosition(roomId, vo.getData(), vo.getRequestId());
    }
}
