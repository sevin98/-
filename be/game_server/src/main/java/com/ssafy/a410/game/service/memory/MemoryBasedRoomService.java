package com.ssafy.a410.game.service.memory;

import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.game.controller.dto.RoomVO;
import com.ssafy.a410.game.domain.Game;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.service.RoomService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MemoryBasedRoomService implements RoomService {
    private static int nextRoomNumber = 1000;

    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, Room> rooms;

    public MemoryBasedRoomService(UserService userService, SimpMessagingTemplate messagingTemplate) {
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
        this.rooms = new ConcurrentHashMap<>();
    }

    @Override
    public Room createRoom(String userProfileUuid, String password) {
        // 실제로 존재하는 사용자만 방을 만들 수 있음
        if (!userService.isExistUserProfile(userProfileUuid)) {
            throw new GameException("User profile not found");
        }

        // 다음 번호로 방을 만들고, 방 목록에 추가한 다음
        Room room = new Room(Integer.toString(getNextRoomNumber()), password);
        rooms.put(room.getRoomNumber(), room);

        Game game = new Game(room, messagingTemplate);
        Thread gameThread = new Thread(game);
        gameThread.start();

        return room;
    }

    private int getNextRoomNumber() {
        synchronized (MemoryBasedRoomService.class) {
            int roomNumber = nextRoomNumber++;
            if (nextRoomNumber > 9999) {
                nextRoomNumber = 1000;
            }
            return roomNumber;
        }
    }

    @Override
    public void joinRoom(Room room, Player player, String password) {
        if (!room.canJoin(player)) {
            throw new GameException("Room is full or game has started");
        }
        room.addPlayer(player);
    }

    @Override
    public void joinRoom(String roomId, Player player, String password) {
        Room room = findRoomById(roomId).orElseThrow(() -> new GameException("Room not found"));
        joinRoom(room, player, password);
    }

    @Override
    public void leaveRoom(Room room, Player player) {
        if (!room.has(player)) {
            throw new GameException("Player is not in room");
        }
        room.removePlayer(player);
        RoomVO roomVO = new RoomVO(room);
        messagingTemplate.convertAndSend(roomVO.getTopic(), roomVO);
    }

    @Override
    public void leaveRoom(String roomId, Player player) {
        Room room = findRoomById(roomId).orElseThrow(() -> new GameException("Room not found"));
        leaveRoom(room, player);
    }

    @Override
    public void setPlayerReady(Room room, Player player) {
        if (!room.has(player)) {
            throw new GameException("Player is not in room");
        }
        player.setReady();
        if (room.isReadyToStartGame()) {
            RoomVO roomVO = new RoomVO(room);
            messagingTemplate.convertAndSend(roomVO.getTopic(), roomVO);
        }
    }

    @Override
    public void setPlayerReady(String roomId, Player player) {
        Room room = findRoomById(roomId).orElseThrow(() -> new GameException("Room not found"));
        setPlayerReady(room, player);
    }

    @Override
    public List<Room> getAllRooms() {
        return List.copyOf(rooms.values());
    }

    @Override
    public Optional<Room> findRoomById(String roomId) {
        return Optional.ofNullable(rooms.get(roomId));
    }
}