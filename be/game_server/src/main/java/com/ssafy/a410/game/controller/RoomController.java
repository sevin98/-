package com.ssafy.a410.game.controller;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.game.controller.dto.CreateRoomRequestDTO;
import com.ssafy.a410.game.controller.dto.RoomVO;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Set;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<RoomVO> createRoom(CreateRoomRequestDTO createRoomRequest, Principal principal) {
        Room newRoom = roomService.createRoom(principal.getName(), createRoomRequest.password());
        RoomVO roomVO = new RoomVO(newRoom);
        return ResponseEntity.status(HttpStatus.CREATED).body(roomVO);
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

    @PostMapping("/{roomId}/ready")
    public ResponseEntity<RoomVO> setPlayerReady(@PathVariable String roomId) {
        String uuid = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UserProfile userProfile = userService.getUserProfileByUuid(uuid);
        Room room = roomService.findRoomById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        Player player = new Player(userProfile.getUuid(), userProfile.getNickname(), room);
        roomService.setPlayerReady(roomId, player);
        RoomVO roomVO = new RoomVO(room);
        return ResponseEntity.ok(roomVO);
    }
}
