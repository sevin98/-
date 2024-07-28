package com.ssafy.a410.game.controller.dto;

public record JoinRoomRespDTO(
        SubscriptionInfoDTO roomSubscriptionInfo,
        SubscriptionInfoDTO playerSubscriptionInfo
) {
}
