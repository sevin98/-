package com.ssafy.a410.auth.controller.dto;

import com.ssafy.a410.auth.domain.UserRole;

public record UserProfileVO(String uuid, String nickname, UserRole role) {
}
