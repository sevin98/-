package com.ssafy.a410.socket.service;

import com.ssafy.a410.socket.model.SocketClient;

import java.io.Serializable;

public interface SocketMessagingService {
    void setConnectionListener();

    void setMessageListener();

    void setDisconnectionListener();

    void sendMessageTo(SocketClient sender, SocketClient receiver, Serializable content);
}
