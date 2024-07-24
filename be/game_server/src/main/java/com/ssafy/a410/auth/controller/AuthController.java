package com.ssafy.a410.auth.controller;

import com.ssafy.a410.auth.controller.dto.GuestSignUpRequest;
import com.ssafy.a410.auth.controller.dto.GuestSignUpResponse;
import com.ssafy.a410.auth.controller.dto.UserProfileVO;
import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.service.AuthService;
import com.ssafy.a410.auth.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final AuthService authService;

    /**
     * 게스트 사용자가 사용할 닉네임을 전달 받아, 생성된 게스트 사용자 정보와 Access Token을 반환한다.
     * 반환된 Access Token은 WebSocket handshake 과정에서 header에 포함될 것이 요구된다..
     *
     * @see com.ssafy.a410.common.interceptor.CustomChannelInterceptor
     */
    @PostMapping("/guest/sign-up")
    public GuestSignUpResponse guestSignUp(@RequestBody GuestSignUpRequest requestDTO) {
        UserProfile guestUserProfile = userService.createGuestUserProfile(requestDTO.nickname());
        String accessToken = authService.getAccessTokenOf(guestUserProfile);
        return new GuestSignUpResponse(accessToken, new UserProfileVO(guestUserProfile));
    }
}
