package com.ssafy.a410.socket.interceptor;

import com.ssafy.a410.socket.controller.dto.SubscriptionTokenResp;
import com.ssafy.a410.socket.handler.SocketSubscriptionHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class DispatchingInterceptor implements ChannelInterceptor {

    private final List<SocketSubscriptionHandler> socketSubscriptionHandlers;

    public DispatchingInterceptor(RoomSubscriptionHandler roomSubscriptionHandler) {
        this.socketSubscriptionHandlers = List.of(roomSubscriptionHandler);
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        if (command == null) {
            return ChannelInterceptor.super.preSend(message, channel);
        } else if (command.equals(StompCommand.SUBSCRIBE)) {
            String destination = accessor.getDestination();
            String clientId = accessor.getUser().getName();
            String token = accessor.getFirstNativeHeader(SubscriptionTokenResp.SUBSCRIPTION_TOKEN_HEADER);

            // 해당 구독 요청을 처리할 수 있는 handler가 있는지 확인하여 없으면 구독 거부
            SocketSubscriptionHandler handler = getMatchedHandler(destination);
            if (handler == null) {
                return null;
            }

            // 권한이 없어도 구독 거부
            if (!handler.hasPermission(destination, clientId, token)) {
                return null;
            }

            // 처리할 수 있으면 핸들러에서 적절히 처리 (비동기 권장)
            handler.handle(destination, clientId);
        }

        return ChannelInterceptor.super.preSend(message, channel);
    }

    // 해당 destination을 처리할 수 있는 handler가 있는지 확인한 후 매치되는 handler가 있으면 반환
    private SocketSubscriptionHandler getMatchedHandler(String destination) {
        return socketSubscriptionHandlers.stream().
                filter(handler -> handler.isTarget(destination))
                .findFirst()
                .orElse(null);
    }
}
