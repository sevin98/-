package com.ssafy.a410.common.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum JWTType {
    // API 인증 토큰
    AUTH_ACCESS,
    // API 인증 토큰 갱신 토큰
    AUTH_REFRESH,
    // 임시 인증 토큰 (방 출입 권한 확인 등에 사용)
    TEMPORARY
}
