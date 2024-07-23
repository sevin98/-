package auth.service;

import auth.domain.UserProfile;

public interface UserService {
    UserProfile getUserProfileById(int id);

    UserProfile getUserProfileByUuid(String uuid);

    UserProfile createGuestUserProfile(String nickname);
}
