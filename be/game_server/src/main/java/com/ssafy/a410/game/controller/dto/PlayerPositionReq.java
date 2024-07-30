package com.ssafy.a410.game.controller.dto;

import com.ssafy.a410.game.domain.player.PlayerDirection;

// 사용자가 위치를 공유하기 위한 DTO
public record PlayerPositionReq(
        double x,
        double y,
        PlayerDirection direction
) {
}
