package com.ssafy.a410.auth.service;

import com.ssafy.a410.auth.domain.UserProfile;

public interface UserService {

    UserProfile getUserProfileByUuid(String uuid);

    UserProfile createGuestUserProfile();

    String generateUniqueRandomNickname();
}
