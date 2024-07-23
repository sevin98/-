package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;

import java.util.List;
import java.util.Optional;

// 방의 운영
public interface RoomService {
    void joinRoom(Room room, Player player);

    void joinRoom(String roomId, Player player);

    void leaveRoom(Room room, Player player);

    void leaveRoom(String roomId, Player player);

    List<Room> getAllRooms();

    Optional<Room> findRoomById(String roomId);
}
