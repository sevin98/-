package com.ssafy.a410.auth.service;

import com.ssafy.a410.auth.domain.UserProfile;

public interface UserService {
    UserProfile getUserProfileById(int id);

    UserProfile getUserProfileByUuid(String uuid);

    UserProfile createGuestUserProfile(String nickname);
}
