package com.ssafy.a410.auth.service;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.model.entity.AuthInfoEntity;

public interface UserService {

    UserProfile getUserProfileByUuid(String uuid);

    UserProfile getUserProfileByLoginId(String loginId);

    UserProfile createGuestUserProfile();

    String generateUniqueRandomNickname();

    boolean isExistUserProfile(String uuid);

    UserProfile updateUserProfile(UserProfile userProfile);

    AuthInfoEntity getAuthInfoByPlayerId(String playerId);

    void updateAuthInfo(AuthInfoEntity authInfo);
}
