package com.ssafy.a410.auth.service;

import com.ssafy.a410.auth.domain.UserProfile;

public interface UserService {

    UserProfile getUserProfileByUuid(String uuid);

    UserProfile getUserProfileByLoginId(String loginId);

    UserProfile createGuestUserProfile();

    String generateUniqueRandomNickname();

    boolean isExistUserProfile(String uuid);

    UserProfile updateUserProfile(UserProfile userProfile);
}
