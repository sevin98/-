package com.ssafy.a410.auth.controller;

import com.ssafy.a410.auth.controller.dto.GuestSignUpRequest;
import com.ssafy.a410.auth.controller.dto.GuestSignUpResponse;
import com.ssafy.a410.auth.controller.dto.UserProfileVO;
import com.ssafy.a410.auth.domain.UserRole;
import com.ssafy.a410.common.constant.MilliSecOf;
import com.ssafy.a410.common.service.JWTService;
import com.ssafy.a410.common.service.JWTType;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JWTService jwtService;

    @PostMapping("/guest/sign-up")
    public GuestSignUpResponse guestSignUp(@RequestBody GuestSignUpRequest requestDTO) {
        // 이런 식으로 게스트에 대한 JWT 발급할 예정
        Map<String, Object> claims = Map.of(
                "nickname", requestDTO.nickname()
        );
        String accessToken = jwtService.generateToken(JWTType.TEMPORARY, claims, 10L * MilliSecOf.SECONDS);
        String refreshToken = jwtService.generateToken(JWTType.TEMPORARY, claims, 30L * MilliSecOf.DAYS);
        UserProfileVO userProfile = new UserProfileVO("uuid", requestDTO.nickname(), UserRole.GUEST);
        return new GuestSignUpResponse(accessToken, refreshToken, userProfile);
    }
}
