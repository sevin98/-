package com.ssafy.a410.game.controller.dto;

import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;

@Getter
public class RoomVO implements Subscribable {
    private final String roomNumber;

    public RoomVO(Room room) {
        this.roomNumber = room.getRoomNumber();
    }

    @Override
    public String getTopic() {
        return "/topic/rooms/" + roomNumber;
    }
}
