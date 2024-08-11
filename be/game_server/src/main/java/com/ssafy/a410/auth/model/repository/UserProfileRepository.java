package com.ssafy.a410.auth.model.repository;

import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfileEntity, Integer> {
    Optional<UserProfileEntity> findById(int id);

    Optional<UserProfileEntity> findByUuid(String uuid);

    boolean existsByNickname(String nickname);

    boolean existsByUuid(String uuid);

    Page<UserProfileEntity> findAllByOrderByWinsDesc(Pageable pageable);

    Page<UserProfileEntity> findAllByOrderByCatchCountDesc(Pageable pageable);

    Page<UserProfileEntity> findAllByOrderBySurvivalTimeInSecondsDesc(Pageable pageable);
}
