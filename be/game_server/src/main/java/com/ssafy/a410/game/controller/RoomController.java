package com.ssafy.a410.game.controller;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.game.controller.dto.JoinRoomRequestDTO;
import com.ssafy.a410.game.controller.dto.RoomVO;
import com.ssafy.a410.game.controller.dto.CreateRoomRequestDTO;
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
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<RoomVO> createRoom(CreateRoomRequestDTO createRoomRequestDTO, Principal principal) {
        Room newRoom = roomService.createRoom(principal.getName(), createRoomRequestDTO.password());
        RoomVO roomVO = new RoomVO(newRoom);
        return ResponseEntity.status(HttpStatus.CREATED).body(roomVO);
    }

    //방 입장
    @PostMapping("/{roomId}/join")
    public ResponseEntity<RoomVO> joinRoom(@PathVariable String roomId,  @RequestBody(required = false) JoinRoomRequestDTO joinRoomRequestDTO) {

        // 인증된 사용자의 UUID 를 가져옴
        String uuid = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 해당 uuid에 맞는 사용자 프로필 가져옴
        UserProfile userProfile = userService.getUserProfileByUuid(uuid);
        Player player = new Player(userProfile.getUuid(), userProfile.getNickname());

        String password = (joinRoomRequestDTO != null) ? joinRoomRequestDTO.password() : "";

        Room room = roomService.joinRoom(roomId, player, password);
        RoomVO roomVO = new RoomVO(room);

        messagingTemplate.convertAndSend("/topic/room/" + roomId, roomVO);
        return ResponseEntity.ok(roomVO);
    }

    // 개발 완료되면 삭제
    // 해당 방 번호에 누가 들어있는지 확인(일단 닉네임만)
    @GetMapping("/{roomId}/players")
    public ResponseEntity<Set<String>> getRoomPlayers(@PathVariable String roomId) {
        Room room = roomService.findRoomById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        Set<String> playerNicknames = room.getPlayers().values().stream()
                .map(Player::getNickname)
                .collect(Collectors.toSet());
        return ResponseEntity.ok(playerNicknames);
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
