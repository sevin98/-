package com.ssafy.a410.game.service.memory;

import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.service.RoomService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MemoryBasedRoomService implements RoomService {
    private final Map<String, Room> rooms;

    public MemoryBasedRoomService() {
        rooms = new ConcurrentHashMap<>();
    }

    @Override
    public void joinRoom(Room room, Player player) {
        if (!player.canJoinTo(room)) {
            throw new GameException("Room is full");
        } else {
            player.joinTo(room);
        }
    }

    @Override
    public void joinRoom(String roomId, Player player) {
        Room room = findRoomById(roomId).orElseThrow(() -> new GameException("Room not found"));
        joinRoom(room, player);
    }

    @Override
    public void leaveRoom(Room room, Player player) {
        if (player.isIn(room)) {
            throw new GameException("Player is not in room");
        } else {
            player.joinTo(room);
        }
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

    private void startGame() {
        throw new UnsupportedOperationException("Not implemented yet");
//        new Thread(() -> {
//            try {
//                //대기시간 전부 다 일단 5초로 통일
//                Thread.sleep(5000);
//                gameState.setGameRunning(true);
//                while (gameState.isGameRunning()) {
//
//                    gameState.setPhase("HIDE");
//                    Thread.sleep(5000);
//
//                    gameState.setPhase("SEEK");
//                    Thread.sleep(5000);
//                    gameState.switchRoles();
//                }
//            } catch (InterruptedException e) {
//                e.printStackTrace();
//            }
//        }).start();
    }
}
