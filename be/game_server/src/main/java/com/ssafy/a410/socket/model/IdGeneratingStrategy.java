package com.ssafy.a410.socket.model;

import java.util.UUID;

@FunctionalInterface
public interface IdGeneratingStrategy {
    // UUID.randomUUID().toString()을 이용한 기본 Id 생성 전략
    IdGeneratingStrategy UUID_GENERATOR = () -> UUID.randomUUID().toString();

    // 0~9 사이의 숫자로 이루어진 Id 생성 전략
    static IdGeneratingStrategy getNumericIdGenerator(int length) {
        return () -> {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < length; i++) {
                sb.append((int) (Math.random() * 10));
            }
            return sb.toString();
        };
    }

    String generate();
}
