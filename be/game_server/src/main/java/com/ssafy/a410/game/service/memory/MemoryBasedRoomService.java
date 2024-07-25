package com.ssafy.a410.game.service.memory;

import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.domain.CreateRoomRequestDTO;
import com.ssafy.a410.game.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MemoryBasedRoomService implements RoomService {
    private final Map<String, Room> rooms;

    @Autowired
    private WebSocketStompClient stompClient;

    public MemoryBasedRoomService() {
        rooms = new ConcurrentHashMap<>();
    }

    @Override
    public Room createRoom(CreateRoomRequestDTO createRoomRequestDTO) {
        Room room = new Room(createRoomRequestDTO.roomNumber());
        Player player = createRoomRequestDTO.player();
        room.addPlayer(player);
        rooms.put(room.getId(), room);
        subscribePlayerToRoomTopic(room.getId(), player);
        return room;
    }

    @Override
    public void joinRoom(Room room, Player player) {
        if (!room.canJoin(player)) {
            throw new GameException("Room is full or game has started");
        }
        room.addPlayer(player);
        subscribePlayerToRoomTopic(room.getId(), player);
    }

    @Override
    public void joinRoom(String roomId, Player player) {
        Room room = findRoomById(roomId).orElseThrow(() -> new GameException("Room not found"));
        joinRoom(room, player);
    }

    @Override
    public void leaveRoom(Room room, Player player) {
        if (!room.has(player)) {
            throw new GameException("Player is not in room");
        }
        room.removePlayer(player);
    }

    @Override
    public void leaveRoom(String roomId, Player player) {
        Room room = findRoomById(roomId).orElseThrow(() -> new GameException("Room not found"));
        leaveRoom(room, player);
    }

    @Override
    public List<Room> getAllRooms() {
        return List.copyOf(rooms.values());
    }

    @Override
    public Optional<Room> findRoomById(String roomId) {
        return Optional.ofNullable(rooms.get(roomId));
    }

    private void subscribePlayerToRoomTopic(String roomId, Player player) {
        stompClient.connect("ws://localhost:8080/ws", new StompSessionHandlerAdapter() {
            @Override
            public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                session.subscribe("/topic/room/" + roomId, new StompSessionHandlerAdapter() {
                    @Override
                    public void handleFrame(StompHeaders headers, Object payload) {
                        // 메시지 처리 로직
                        System.out.println("Player " + player.getId() + " received message: " + payload);
                    }
                });
            }
        });
    }

    private void startGame() {
        throw new UnsupportedOperationException("Not implemented yet");
        // Game start logic can be implemented here
    }
}