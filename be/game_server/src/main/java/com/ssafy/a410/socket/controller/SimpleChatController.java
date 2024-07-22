package com.ssafy.a410.socket.controller;

import com.ssafy.a410.socket.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class SimpleChatController {
    /**
     * /ws/send-message에 메시지를 보내면 해당 메서드로 메시지가 전달된다.
     * 메시지를 받으면, ChatMessage 객체로 감싸서 /topic/messages을 구독한 클라이언트에 메시지를 전파한다.
     */
    @MessageMapping("/send-message")
    @SendTo("/topic/messages")
    public ChatMessage handleChatMessage(String message) {
        return new ChatMessage(message);
    }
}
