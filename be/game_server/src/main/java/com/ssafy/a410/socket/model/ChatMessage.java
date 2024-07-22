package com.ssafy.a410.socket.model;

import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
public class ChatMessage {
    private final String id;
    private final String content;
    private final long sentAt;

    public ChatMessage(String content) {
        this.id = UUID.randomUUID().toString();
        this.content = content;
        this.sentAt = Instant.now().toEpochMilli();
    }
}
