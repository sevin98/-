package com.ssafy.a410.game.service.memory;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.game.controller.dto.JoinRoomRespDTO;
import com.ssafy.a410.game.controller.dto.SubscriptionInfoDTO;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.domain.message.room.control.PlayerInfo;
import com.ssafy.a410.game.domain.message.room.control.RoomControlMessage;
import com.ssafy.a410.game.domain.message.room.control.RoomControlType;
import com.ssafy.a410.game.service.RoomService;
import com.ssafy.a410.game.service.socket.WebSocketGameBroadcastService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class MemoryBasedRoomService implements RoomService {
    // 방의 번호를 생성하기 위한 변수 (WARNING : 멀티 스레드 환경에서 고유성을 보장해 주어야 함)
    private static int nextRoomNumber = 1000;
    // Key: 방 번호 (from `nextRoomNumber`), Value: Room
    private final Map<String, Room> rooms;
    private final UserService userService;
    private final WebSocketGameBroadcastService broadcastService;

    public MemoryBasedRoomService(UserService userService, WebSocketGameBroadcastService broadcastService) {
        this.rooms = new ConcurrentHashMap<>();
        this.userService = userService;
        this.broadcastService = broadcastService;
    }

    @Override
    public Room createRoom(String userProfileUuid, String password) {
        // 실제로 존재하는 사용자만 방을 만들 수 있음
        assertUserProfileExists(userProfileUuid);

        // 다음 번호로 방을 만들고, 방 목록에 추가한 다음
        Room room = new Room(Integer.toString(getNextRoomNumber()), password, broadcastService);
        rooms.put(room.getRoomNumber(), room);

        // 생성된 방을 반환
        return room;
    }

    // 주어진 userProfileUuid를 가진 사용자가 존재하는지 확인
    private void assertUserProfileExists(String userProfileUuid) {
        if (!userService.isExistUserProfile(userProfileUuid)) {
            throw new GameException("User profile not found");
        }
    }

    // [1000, 9999] 범위 내의 고유한 방 번호를 생성
    private int getNextRoomNumber() {
        synchronized (MemoryBasedRoomService.class) {
            int roomNumber = nextRoomNumber++;
            // 9999번을 넘어가면 다시 1000부터 시작
            if (nextRoomNumber > 9999) {
                nextRoomNumber = 1000;
            }
            return roomNumber;
        }
    }

    // 해당 사용자를 방에 추가하여 플레이어로 만들고, 방에 참가 시킴
    @Override
    public Player joinRoom(Room room, UserProfile userProfile) {
        if (!room.canJoin(userProfile)) {
            throw new GameException("Room is full or game has started");
        }
        return room.join(userProfile);
    }

    @Override
    public Player joinRoomWithPassword(String roomId, String userProfileUuid, String password) {
        Room room = getRoomById(roomId);
        UserProfile userProfile = userService.getUserProfileByUuid(userProfileUuid);
        if (!room.isAuthenticatedWith(password)) {
            throw new GameException("Password is incorrect");
        }
        return joinRoom(room, userProfile);
    }

    @Override
    public void leaveRoom(Room room, Player player) {
        if (!room.has(player)) {
            throw new GameException("Player is not in room");
        }
        room.kick(player);
    }

    @Override
    public void setPlayerReady(Room room, Player player) {
        if (!room.has(player)) {
            throw new GameException("Player is not in room");
        }
        // 플레이어를 준비 시켜 놓고
        log.debug("플레이어 [{}]가 준비 되었습니다.", player.getNickname());
        player.setReady();

        // 다른 플레이어들에게 플레이어가 준비되었다고 알림
        RoomControlMessage message = new RoomControlMessage(
                RoomControlType.PLAYER_READY,
                PlayerInfo.getReadyPlayerInfoListFrom(room)
        );
        broadcastService.broadcastTo(room, message);

        // 실행할 수 있으면 게임 시작
        if (room.isReadyToStartGame()) {
            room.startGame(broadcastService);
        }
    }

    @Override
    public void setPlayerReady(String roomId, String userProfileUuid) {
        Room room = getRoomById(roomId);
        UserProfile userProfile = userService.getUserProfileByUuid(userProfileUuid);
        Player player = room.getPlayerWith(userProfile.getUuid());
        setPlayerReady(room, player);
    }

    @Override
    public Optional<Room> findRoomById(String roomId) {
        return Optional.ofNullable(rooms.get(roomId));
    }

    @Override
    public Room getRoomById(String roomId) {
        return findRoomById(roomId).orElseThrow(() -> new GameException("Room not found"));
    }

    @Override
    public JoinRoomRespDTO getJoinRoomSubscriptionTokens(String roomId, String playerId) {
        // 방과 플레이어의 실재 여부 확인
        Room room = getRoomById(roomId);
        Player player = room.getPlayerWith(playerId);
        return new JoinRoomRespDTO(
                new SubscriptionInfoDTO(room),
                new SubscriptionInfoDTO(player)
        );
    }
}