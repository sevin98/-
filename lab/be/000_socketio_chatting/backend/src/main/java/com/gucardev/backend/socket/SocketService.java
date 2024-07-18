package com.gucardev.backend.socket;

import com.corundumstudio.socketio.SocketIOClient;
import com.gucardev.backend.model.Message;
import com.gucardev.backend.model.MessageType;
import com.gucardev.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SocketService {
    private final MessageService messageService;

    public void sendSocketMessage(SocketIOClient senderClient, Message message, String room) {
        // 인자로 받은 room에 참가한 클라이언트들에 대해
        for (
                SocketIOClient client : senderClient.getNamespace().getRoomOperations(room).getClients()) {
            // 송신자는 제외하고
            if (!client.getSessionId().equals(senderClient.getSessionId())) {
                // 이벤트 송신
                client.sendEvent("read_message", message);
            }
        }
    }

    public void saveMessage(SocketIOClient senderClient, Message message) {
        // 메시지를 DB에 저장하고
        Message storedMessage = messageService.saveMessage(Message.builder()
                .messageType(MessageType.CLIENT)
                .content(message.getContent())
                .room(message.getRoom())
                .username(message.getUsername())
                .build());
        // 송신자를 제외하고 방에 등록된 모든 클라이언트들에게 메시지를 전송
        sendSocketMessage(senderClient, storedMessage, message.getRoom());
    }

    public void saveInfoMessage(SocketIOClient senderClient, String message, String room) {
        Message storedMessage = messageService.saveMessage(Message.builder()
                .messageType(MessageType.SERVER)
                .content(message)
                .room(room)
                .build());
        sendSocketMessage(senderClient, storedMessage, room);
    }
}
