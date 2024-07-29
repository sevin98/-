package com.ssafy.a410.game.controller;

import com.ssafy.a410.game.controller.dto.CreateRoomReqDTO;
import com.ssafy.a410.game.controller.dto.JoinRoomReqDTO;
import com.ssafy.a410.game.controller.dto.JoinRoomRespDTO;
import com.ssafy.a410.game.controller.dto.RoomRespDTO;
import com.ssafy.a410.game.domain.Message;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Set;

@Slf4j
@RequiredArgsConstructor
@RestController
public class RoomController {
    private final RoomService roomService;

    // 새 방을 생성한다.
    @PostMapping("/api/rooms")
    public ResponseEntity<RoomRespDTO> createRoom(CreateRoomReqDTO reqDTO, Principal principal) {
        Room newRoom = roomService.createRoom(principal.getName(), reqDTO.password());
        RoomRespDTO roomRespDTO = new RoomRespDTO(newRoom);
        return ResponseEntity.status(HttpStatus.CREATED).body(roomRespDTO);
    }

    // 해당 방에 입장하기 위한 토큰들을 반환한다.
    @PostMapping("/api/rooms/{roomId}/join")
    public ResponseEntity<JoinRoomRespDTO> joinRoom(@PathVariable String roomId, Principal principal, @RequestBody JoinRoomReqDTO req) {
        // 방에 입장시켜 플레이어를 만들고,
        Player player = roomService.joinRoomWithPassword(roomId, principal.getName(), req.password());
        // 방에 입장함과 동시에 구독할 수 있는 token들에 대한 정보를 반환한다.
        JoinRoomRespDTO tokens = roomService.getJoinRoomSubscriptionTokens(roomId, player.getId());
        return ResponseEntity.ok(tokens);
    }

    // 방 나가기
    @PostMapping("/api/rooms/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(@PathVariable String roomId, Principal principal) {
        Room room = roomService.getRoomById(roomId);
        Player player = room.getPlayerWith(principal.getName());
        roomService.leaveRoom(room, player);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    // 개발완료되면 삭제할 메소드
    @GetMapping("/api/rooms/{roomId}/players")
    public ResponseEntity<Set<String>> getRoomPlayers(@PathVariable String roomId) {
        Room room = roomService.findRoomById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        Set<String> playerIds = room.getPlayers().keySet();
        return ResponseEntity.ok(playerIds);
    }

    // 개발완료되면 삭제할 메소드
    @MessageMapping("/check/{roomId}")
    @SendTo("/topic/check/{roomId}")
    public String checkPlayerInRoom(@DestinationVariable String roomId, Message message) {
        Room room = roomService.findRoomById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        if (room.getPlayers().containsKey(message.getSender())) {
            return "Player " + message.getSender() + " is in room " + roomId;
        } else {
            return "Player " + message.getSender() + " is not in room " + roomId;
        }
    }

    // 해당 방에 현재 접속해 있을 때, 레디 상태로 전환된다.
    @MessageMapping("/rooms/{roomId}/ready")
    public void setPlayerReady(@DestinationVariable String roomId, Principal principal) {
        roomService.setPlayerReady(roomId, principal.getName());
    }
}
