package auth.controller.dto;

public record GuestSignUpResponse(
        String accessToken,
        String refreshToken,
        UserProfileVO userProfile
) {
}
