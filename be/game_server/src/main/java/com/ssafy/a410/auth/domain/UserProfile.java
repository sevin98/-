package com.ssafy.a410.auth.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserProfile {
    private int id;
    private String uuid;
    private String nickname;
    private UserRole role;
}
