package com.ssafy.a410.auth.model.repository;

import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfileEntity, Integer> {
}
