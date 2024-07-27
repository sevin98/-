package com.ssafy.a410.socket.handler;

import com.ssafy.a410.common.service.JWTService;
import com.ssafy.a410.common.service.JWTType;
import com.ssafy.a410.socket.controller.dto.SubscriptionTokenResp;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public abstract class SocketSubscriptionHandler {
    protected final JWTService jwtService;

    public abstract boolean isTarget(String destination);

    public abstract void handle(String destination, String clientId);

    public boolean isTemporary(String type) {
        return JWTType.TEMPORARY.equals(type);
    }

    public boolean hasPermission(String destination, String clientId, String token) {
        Claims claims = jwtService.getClaims(token);
        String type = claims.get(JWTType.TYPE_KEY, String.class);
        String expectedDestination = claims.get(SubscriptionTokenResp.DESTINATION_KEY, String.class);
        String expectedClientId = claims.get(SubscriptionTokenResp.CLIENT_ID_KEY, String.class);

        return isTemporary(type) && destination.equals(expectedDestination) && clientId.equals(expectedClientId);
    }
}
