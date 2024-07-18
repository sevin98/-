package com.ssafy.a410.socket.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.ssafy.a410.socket.model.SocketClient;

import java.io.Serializable;

public class SocketIOMessageService implements SocketMessagingService {
    private final SocketIOServer server;

    public SocketIOMessageService(SocketIOServer server) {
        this.server = server;
        this.setConnectionListener();
        this.setMessageListener();
        this.setDisconnectionListener();
    }

    @Override
    public void setConnectionListener() {
        server.addConnectListener(client -> {
            System.out.println("Connected: " + client.getSessionId());
        });
    }

    @Override
    public void setMessageListener() {
        server.addEventListener("message", String.class, (client, data, ackSender) -> {
            System.out.println("Received: " + data);
            client.sendEvent("message", data);
        });
    }

    @Override
    public void setDisconnectionListener() {
        server.addDisconnectListener(client -> {
            System.out.println("Disconnected: " + client.getSessionId());
        });
    }

    @Override
    public void sendMessageTo(SocketClient sender, SocketClient receiver, Serializable content) {

    }
}
