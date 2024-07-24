package com.ssafy.a410.game.controller;

import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.domain.RoomRequest;
import com.ssafy.a410.game.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping("/create")
    public ResponseEntity<Room> createRoom(@RequestBody RoomRequest roomRequest) {
        Room newRoom = roomService.createRoom(roomRequest);
        return ResponseEntity.ok(newRoom);
    }
}
