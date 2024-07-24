package com.ssafy.a410.common.interceptor;

import com.ssafy.a410.auth.service.AuthService;
import com.ssafy.a410.common.service.JWTService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.List;

@Slf4j
@Component
public class CustomChannelInterceptor implements ChannelInterceptor {
    private static final String API_KEY_NAME = "X-API-KEY";

    @Autowired
    private JWTService jwtService;
    @Autowired
    private AuthService authService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        // 클라이언트의 연결 수립 요청인 경우
        if (command == StompCommand.CONNECT) {// API Key가 유효한지 확인하여 사용자 식별
            List<String> headers = accessor.getNativeHeader(API_KEY_NAME);
            // API Key가 요청 프레임에 포함되어 있지 않거나, 유효하지 않은 경우 연결 거부
            if (CollectionUtils.isEmpty(headers) || !isAuthenticated(headers.get(0))) {
                throw new MessageDeliveryException("UNAUTHORIZED");
            }
        }

        return message;
    }

    private boolean isAuthenticated(String apiKey) {
        String userProfileUuid = jwtService.getUuidFromToken(apiKey);
        return authService.isAuthenticatedUserProfileUuid(userProfileUuid);
    }
}
