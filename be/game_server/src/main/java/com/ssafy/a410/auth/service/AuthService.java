package com.ssafy.a410.auth.service;

import com.ssafy.a410.auth.domain.UserProfile;

public interface AuthService {
    String getAccessTokenOf(UserProfile userProfile);

    boolean isAuthenticatedUserProfileUuid(String uuid);
}
