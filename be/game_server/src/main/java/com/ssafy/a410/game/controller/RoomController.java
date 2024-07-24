package com.ssafy.a410.game.controller;

import com.ssafy.a410.game.domain.Message;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.domain.RoomRequest;
import com.ssafy.a410.game.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/create")
    public ResponseEntity<Room> createRoom(@RequestBody RoomRequest roomRequest) {
        Room newRoom = roomService.createRoom(roomRequest);
        return ResponseEntity.ok(newRoom);
    }

    @GetMapping("/api/rooms/{roomId}/players")
    public ResponseEntity<Set<String>> getRoomPlayers(@PathVariable String roomId) {
        Room room = roomService.findRoomById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        Set<String> playerIds = room.getPlayers().keySet();
        return ResponseEntity.ok(playerIds);
    }

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
