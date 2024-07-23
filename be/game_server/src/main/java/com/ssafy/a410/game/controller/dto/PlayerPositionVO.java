package com.ssafy.a410.game.controller.dto;

import com.ssafy.a410.game.domain.PlayerDirection;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

// 사용자의 위치
public record PlayerPositionVO(
        // 사용자 고유 식별자
        @NotEmpty(message = "playerId must not be empty")
        String playerId,
        // 사각형의 좌상단을 (0, 0)으로 했을 때,
        @NotNull(message = "x must not be null")
        @Min(value = 0, message = "x must be greater than or equal to 0")
        int x, // 오른쪽 방향으로 떨어진 거리
        @NotNull(message = "y must not be null")
        @Min(value = 0, message = "y must be greater than or equal to 0")
        int y, // 아래쪽 방향으로 떨어진 거리
        @NotNull(message = "direction must not be null")
        PlayerDirection direction // 플레이어가 현재 바라보고 있는 방향
) {
}
