package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;

import java.util.List;
import java.util.Optional;

// 방의 운영
public interface RoomService {
    Room createRoom(String userProfileUuid, String password);

    void joinRoom(Room room, Player player, String password);

    void joinRoom(String roomId, Player player, String password);

    void leaveRoom(Room room, Player player);

    void leaveRoom(String roomId, Player player);

    void setPlayerReady(Room room, Player player);

    void setPlayerReady(String roomId, Player player);

    List<Room> getAllRooms();

    Optional<Room> findRoomById(String roomId);
}
