package com.ssafy.a410.game.controller;

import com.ssafy.a410.game.controller.dto.PlayerPositionReq;
import com.ssafy.a410.game.service.GameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@RequiredArgsConstructor
@Controller
public class GameController {
    private final GameService gameService;

    // 요청한 클라이언트에게 개인 채널로 방에 대한 정보를 송신한다.
    @MessageMapping("/rooms/{roomId}/game")
    public void sendGameInfoToPlayer(@DestinationVariable String roomId, Principal principal) {
        gameService.sendGameInfoToPlayer(roomId, principal.getName());
    }

    // 클라이언트의 위치를 게임에 공유한다.
    @MessageMapping("/rooms/{roomId}/game/share-position")
    public void sharePosition(@DestinationVariable String roomId, Principal principal, PlayerPositionReq playerPositionReq) {
        gameService.sharePosition(roomId, principal.getName(), playerPositionReq);
    }
}
