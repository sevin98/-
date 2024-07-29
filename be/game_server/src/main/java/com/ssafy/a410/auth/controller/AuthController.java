package com.ssafy.a410.auth.controller;

import com.ssafy.a410.auth.controller.dto.GuestSignUpResponse;
import com.ssafy.a410.auth.controller.dto.UserProfileVO;
import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.service.AuthService;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.constant.MilliSecOf;
import com.ssafy.a410.common.service.JWTService;
import com.ssafy.a410.common.service.JWTType;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final AuthService authService;
    private final JWTService jwtService;

    /**
     * 게스트 사용자가 사용할 닉네임을 전달 받아, 생성된 게스트 사용자 정보와 Access Token을 반환한다.
     * 반환된 Access Token은 WebSocket handshake 과정에서 HTTP header에 포함되어야 한다.
     *
     * @see com.ssafy.a410.common.filter.HTTPJWTAuthFilter
     */
    @PostMapping("/guest/sign-up")
    public GuestSignUpResponse guestSignUp() {
        UserProfile guestUserProfile = userService.createGuestUserProfile();
        String accessToken = authService.getAccessTokenOf(guestUserProfile);
        String webSocketConnectionToken = jwtService.generateToken(JWTType.WEBSOCKET_CONNECTION, Map.of("userProfileUuid", guestUserProfile.getUuid()), 10L * MilliSecOf.SECONDS);
        return new GuestSignUpResponse(accessToken, new UserProfileVO(guestUserProfile), webSocketConnectionToken);
    }
}
