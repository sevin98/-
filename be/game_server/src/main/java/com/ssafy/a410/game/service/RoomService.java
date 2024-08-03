package com.ssafy.a410.game.service;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.socket.controller.dto.SubscriptionTokenResp;

import java.util.List;
import java.util.Optional;

// 방의 운영
public interface RoomService {
    Room createRoom(String userProfileUuid, String password);

    Player joinRoom(Room room, UserProfile userProfile);

    Player joinRoom(String roomId, UserProfile userProfile);

    void leaveRoom(Room room, Player player);

    void leaveRoom(String roomId, Player player);

    void setPlayerReady(Room room, Player player);

    void setPlayerReady(String roomId, Player player);

    List<Room> getAllRooms();

    Optional<Room> findRoomById(String roomId);

    SubscriptionTokenResp getRoomJoinToken(String roomId, String userProfileUuid, String password);
}
