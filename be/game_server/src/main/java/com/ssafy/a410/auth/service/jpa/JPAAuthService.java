package com.ssafy.a410.auth.service.jpa;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.service.AuthService;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.constant.MilliSecOf;
import com.ssafy.a410.common.service.JWTService;
import com.ssafy.a410.common.service.JWTType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@RequiredArgsConstructor
@Slf4j
@Service
public class JPAAuthService implements AuthService {
    private static final long ACCESS_TOKEN_EXPIRE = MilliSecOf.MONTHS;
    private final JWTService jwtService;
    private final UserService userService;

    @Override
    public String getAccessTokenOf(UserProfile userProfile) {
        Map<String, Object> claims = Map.of(
                "uuid", userProfile.getUuid(),
                "role", userProfile.getRole()
        );
        return jwtService.generateToken(JWTType.AUTH_ACCESS, claims, ACCESS_TOKEN_EXPIRE);
    }

    @Override
    public boolean isAuthenticatedUserProfileUuid(String uuid) {
        try {
            return userService.getUserProfileByUuid(uuid) != null;
        } catch (Exception e) {
            log.error("JPAAuthService.isAuthenticatedUserUuid throws not exist UserProfile uuid: {} / {}",
                    uuid, e.getMessage());
            throw e;
        }
    }
}
