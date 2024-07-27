package com.ssafy.a410.game.controller;

import com.ssafy.a410.common.controller.dto.SocketClientRequestVO;
import com.ssafy.a410.game.controller.dto.PlayerPositionVO;
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
    @MessageMapping("/rooms/{roomId}/players/position")
    public void handlePlayerPosition(@Validated @Payload SocketClientRequestVO<PlayerPositionVO> vo, @DestinationVariable String roomId) {
        // TODO : Principal로 사용자 정보 받아서 게임 채널에 메시지 전송해야 함
    }
}
