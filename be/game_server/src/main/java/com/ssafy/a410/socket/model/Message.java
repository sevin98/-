package com.ssafy.a410.socket.model;

import java.io.Serializable;
import java.time.Instant;

public class Message {
    private static final IdGeneratingStrategy DEFAULT_ID_GENERATING_STRATEGY = IdGeneratingStrategy.UUID_GENERATOR;
    public static String SYSTEM_SENDER = "SYSTEM";

    // 메시지 식별자
    String id;
    // 메시지 내용
    Serializable content;


    public Message(IdGeneratingStrategy idGeneratingStrategy, String senderId, String receiverId, Serializable content, long sendTimestamp) {
        this.id = idGeneratingStrategy.generate();
    }

    public static Message getDefaultMessage(String senderId, String receiverId, Serializable content) {
        return new Message(DEFAULT_ID_GENERATING_STRATEGY, senderId, receiverId, content, Instant.now().toEpochMilli());
    }
}
