package com.ssafy.a410.auth.controller.dto;

public record GuestSignUpResponse(
        String accessToken,
        String refreshToken,
        UserProfileVO userProfile
) {
}
