package com.ssafy.a410.game.service;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.game.controller.dto.JoinRoomRespDTO;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;

import java.util.Optional;

// 방의 운영
public interface RoomService {
    Room createRoom(String userProfileUuid, String password);

    Player joinRoom(Room room, UserProfile userProfile);

    Player joinRoomWithPassword(String roomId, String userProfileUuid, String password);

    void leaveRoom(Room room, Player player);

    void setPlayerReady(Room room, Player player);

    void setPlayerReady(String roomId, String userProfileUuid);

    Optional<Room> findRoomById(String roomId);

    Room getRoomById(String roomId);

    JoinRoomRespDTO getJoinRoomSubscriptionTokens(String roomId, String playerId);
}
