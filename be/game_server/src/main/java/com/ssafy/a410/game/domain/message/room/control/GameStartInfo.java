package com.ssafy.a410.game.domain.message.room.control;

import com.ssafy.a410.game.controller.dto.SubscriptionInfoDTO;

/**
 * 클라이언트에서 게임을 시작하기 위해 필요한 정보를 담음
 * @param subscriptionInfoDTO 구독 정보
 * @param startsAfterMilliSec 게임 시작까지 남은 시간 (ms)
 */
public record GameStartInfo(
        SubscriptionInfoDTO subscriptionInfoDTO,
        long startsAfterMilliSec
) {
}
