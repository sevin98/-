package com.ssafy.a410.game.service.memory;

import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.game.controller.dto.RoomVO;
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
    private final Map<String, Room> rooms;
    private final SimpMessagingTemplate messagingTemplate;
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

        // 클래스 레벨로 방 참여 코드 동기화
        int roomNumber = -1;
        synchronized (MemoryBasedRoomService.class) {
            roomNumber = nextRoomNumber++;
            // [1000, 9999] 구간의 코드만 사용
            if (nextRoomNumber > 9999) {
                nextRoomNumber = 1000;
            }
        }

        // 다음 번호로 방을 만들고, 방 목록에 추가한 다음
        Room room = new Room(Integer.toString(roomNumber), password);
        rooms.put(room.getRoomNumber(), room);
        return room;
    }

    @Override
    public void joinRoom(String roomId, Player player, String password) {
        Room room = findRoomById(roomId).orElseThrow(() -> new GameException("Room not found"));

        // 비밀번호가 틀리다면
        if (room.getPassword() != null && !room.getPassword().isEmpty() && !room.getPassword().equals(password))
            throw new GameException("Invalid room password");

        // 방에 사람이 더 들어올 수 없거나, 게임이 시작되었다면.
        if(!room.canJoin(player)) throw new GameException("Room is full or game has started");
        //사람추가
        room.addPlayer(player);
        //subscribeTopic -> 클라이언트단
        RoomVO roomVO = new RoomVO(room);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, roomVO);
    }

    @Override
    public void leaveRoom(String roomId, Player player) {
        Room room = findRoomById(roomId).orElseThrow(() -> new GameException("Room not found"));

        //방에 해당 플레이어가 없으면
        if (!room.has(player))
            throw new GameException("Player is not in room");
        //게임이 진행중이거나, 카운트다운이 시작되었다면
        if (room.isGameRunning() || room.isReadyToStartGame())
            throw new GameException("Cannot leave room during game or countdown");

        room.removePlayer(player);
        RoomVO roomVO = new RoomVO(room);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, roomVO);
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