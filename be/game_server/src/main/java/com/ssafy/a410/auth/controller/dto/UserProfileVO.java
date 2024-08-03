package com.ssafy.a410.auth.controller.dto;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.domain.UserRole;

public record UserProfileVO(String uuid, String nickname, UserRole role) {
    public UserProfileVO(UserProfile userProfile) {
        this(userProfile.getUuid(), userProfile.getNickname(), userProfile.getRole());
    }
}
