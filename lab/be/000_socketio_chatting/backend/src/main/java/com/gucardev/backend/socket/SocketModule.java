package com.gucardev.backend.socket;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.gucardev.backend.constants.Constants;
import com.gucardev.backend.model.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@Slf4j
public class SocketModule {
    private final SocketIOServer server;
    private final SocketService socketService;

    public SocketModule(SocketIOServer server, SocketService socketService) {
        this.server = server;
        this.socketService = socketService;
        // 소켓에 클라이언트가 연결 되었을 때 호출할 리스너 등록
        server.addConnectListener(onConnected());
        // 소켓에서 클라이언트가 연결 해제 되었을 때 호출할 리스너 등록
        server.addDisconnectListener(onDisconnected());
        // "send_message" 이벤트를 받았을 때 호출할 리스너 등록
        server.addEventListener("send_message", Message.class, onChatReceived());
    }

    private DataListener<Message> onChatReceived() {
        return (senderClient, data, ackSender) -> {
            log.info(data.toString());
            socketService.saveMessage(senderClient, data);
        };
    }

    private ConnectListener onConnected() {
        return (client) -> {
            // URL parameter에서 방과 사용자 이름을 받아서
            var params = client.getHandshakeData().getUrlParams();
            String room = String.join("", params.get("room"));
            String username = String.join("", params.get("username"));
            // Room에 입장시킴
            client.joinRoom(room);
        
            // client를 송신자로 room의 모든 클라이언트에게 환영 메시지 송신
            socketService.saveInfoMessage(client, String.format(Constants.WELCOME_MESSAGE, username), room);
            log.info("Socket ID[{}] - room[{}] - username [{}]  Connected to chat module through", client.getSessionId().toString(), room, username);
        };

    }

    private DisconnectListener onDisconnected() {
        return client -> {
            // URL parameter에서 방과 사용자 이름을 받아서
            var params = client.getHandshakeData().getUrlParams();
            String room = String.join("", params.get("room"));
            String username = String.join("", params.get("username"));
            
            // client를 송신자로 room의 모든 클라이언트에게 접속 해제 메시지 송신
            socketService.saveInfoMessage(client, String.format(Constants.DISCONNECT_MESSAGE, username), room);
            log.info("Socket ID[{}] - room[{}] - username [{}]  discnnected to chat module through", client.getSessionId().toString(), room, username);
        };
    }
}
