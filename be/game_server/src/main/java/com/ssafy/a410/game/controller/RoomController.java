package com.ssafy.a410.game.controller;

import com.ssafy.a410.game.domain.Message;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.domain.CreateRoomRequestDTO;
import com.ssafy.a410.game.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody CreateRoomRequestDTO createRoomRequestDTO) {
        Room newRoom = roomService.createRoom(createRoomRequestDTO);
        return ResponseEntity.ok(newRoom);
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
}
