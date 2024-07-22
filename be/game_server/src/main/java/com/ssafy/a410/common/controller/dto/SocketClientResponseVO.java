package com.ssafy.a410.common.controller.dto;

import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
public class SocketClientResponseVO<T> {
    private final String requestId;
    private final String responseId;
    private final T data;
    private final long sentAt;

    public SocketClientResponseVO(String requestId, T data) {
        this.requestId = requestId;
        this.responseId = UUID.randomUUID().toString();
        this.data = data;
        this.sentAt = Instant.now().toEpochMilli();
    }
}
