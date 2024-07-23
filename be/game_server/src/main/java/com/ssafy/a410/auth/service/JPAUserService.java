package com.ssafy.a410.auth.service;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import com.ssafy.a410.auth.model.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class JPAUserService implements UserService {
    private final UserProfileRepository userProfileRepository;

    private UserProfile getUserProfileById(int id) {
        UserProfileEntity userProfile = userProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserProfile.fromEntity(userProfile);
    }

    @Override
    public UserProfile getUserProfileByUuid(String uuid) {
        UserProfileEntity userProfile = userProfileRepository.findByUuid(uuid)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserProfile.fromEntity(userProfile);
    }

    @Override
    public UserProfile createGuestUserProfile(String nickname) {
        UserProfileEntity requestEntity = UserProfileEntity.builder()
                .nickname(nickname)
                .build();
        UserProfileEntity createdEntity = userProfileRepository.save(requestEntity);
        return UserProfile.fromEntity(createdEntity);
    }
}
