package com.ssafy.a410.game.controller;

import com.ssafy.a410.game.controller.dto.BlockingReq;
import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.item.ItemUseReq;
import com.ssafy.a410.game.domain.game.item.ItemUseRequestDto;
import com.ssafy.a410.game.domain.player.message.response.PlayerRequestType;
import com.ssafy.a410.game.domain.player.message.response.RequestResultMessage;
import com.ssafy.a410.game.controller.dto.PlayerPositionReq;
import com.ssafy.a410.game.domain.game.message.request.InteractSeekReq;
import com.ssafy.a410.game.domain.game.message.request.InteractHideReq;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.service.GameService;
import com.ssafy.a410.game.service.InteractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;


@Slf4j
@RequiredArgsConstructor
@RestController
public class GameController {
    private final GameService gameService;
    private final InteractService interactService;

    // 요청한 클라이언트에게 개인 채널로 방에 대한 정보를 송신한다.
    @MessageMapping("/rooms/{roomId}/game")
    public void sendGameInfoToPlayer(@DestinationVariable String roomId, @Payload BlockingReq<Void> req, Principal principal) {
        gameService.sendGameInfoToPlayer(roomId, principal.getName(), req.getRequestId());
    }

    // 클라이언트의 위치를 게임에 공유한다.
    @MessageMapping("/rooms/{roomId}/game/share-position")
    public void sharePosition(@DestinationVariable String roomId, Principal principal, PlayerPositionReq playerPositionReq) {
        gameService.sharePosition(roomId, principal.getName(), playerPositionReq);
    }

    // 오브젝트와 상호작용해서 숨는다.
    @MessageMapping("/rooms/{roomId}/game/hide")
    public void hideOnHPObject(@DestinationVariable String roomId, Principal principal, @Payload BlockingReq<InteractHideReq> req) {
        InteractHideReq interactHideReq = req.getData();
        interactHideReq.setRequestId(req.getRequestId());
        interactHideReq.setPlayerId(principal.getName());
        interactHideReq.setRoomId(roomId);
        interactService.hideOnHPObject(interactHideReq);
    }

    // 오브젝트와 상호작용하여 숨은 플레이어 탐색을 시도한다.
    @MessageMapping("/rooms/{roomId}/game/seek")
    public void seekObject(@DestinationVariable String roomId, @Payload BlockingReq<InteractSeekReq> req, Principal principal) {
        InteractSeekReq interactSeekReq = req.getData();
        interactSeekReq.setRequestId(req.getRequestId());
        interactSeekReq.setPlayerId(principal.getName());
        interactSeekReq.setRoomId(roomId);
        interactService.seekObject(interactSeekReq);
    }

    // 오브젝트에 아이템을 숨긴다
    @PostMapping("/rooms/{roomId}/game/use/item")
    public void useItem(@PathVariable String roomId, @RequestBody ItemUseReq requestDto, Principal principal) {
        String playerId = principal.getName();
        requestDto.setPlayerId(playerId);
        requestDto.setRoomId(roomId);
        interactService.useItem(requestDto);
    }
}
