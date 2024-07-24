package com.ssafy.a410.auth.service.jpa;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.domain.UserRole;
import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import com.ssafy.a410.auth.model.repository.UserProfileRepository;
import com.ssafy.a410.auth.service.UserService;
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
        // 게스트 정보 저장하고
        UserProfileEntity requestEntity = UserProfileEntity.builder()
                .nickname(nickname)
                .uuid(java.util.UUID.randomUUID().toString())
                .role(UserRole.GUEST)
                .build();
        UserProfileEntity createdEntity = userProfileRepository.save(requestEntity);
        // 도메인 객체로 바꿔 반환
        return UserProfile.fromEntity(createdEntity);
    }
}
