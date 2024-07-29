package com.ssafy.a410.socket.handler;

import org.springframework.stereotype.Component;

/**
 * Websocket 클라이언트의 특정 destination 구독에 대한 authorization을 수행하는 핸들러 인터페이스
 */
@Component
public abstract class SocketSubscriptionHandler {
    public abstract boolean isTarget(String destination);

    public abstract void handle(String destination, String clientId);

    public abstract boolean hasPermission(String destination, String token);
}
