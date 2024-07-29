package com.ssafy.a410.auth.controller.dto;

public record GuestSignUpResponse(
        String accessToken,
        UserProfileVO userProfile,
        String webSocketConnectionToken
) {
}
