package com.ssafy.a410.socket.model;

import java.io.Serializable;

public interface SocketClient {
    String getId();

    void sendToMe(Serializable content);

    void sendToIndividual(SocketClient receiver, Serializable content);

    void sendToRoom(Room room, Serializable content);

    void joinTo(Room room);

    void leaveFrom(Room room);

    boolean isJoined(Room room);
}
