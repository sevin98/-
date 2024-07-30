package com.ssafy.a410.room.controller.dto;

import com.ssafy.a410.socket.controller.dto.SubscriptionInfoDTO;

public record JoinRoomRespDTO(
        SubscriptionInfoDTO roomSubscriptionInfo,
        SubscriptionInfoDTO playerSubscriptionInfo
) {
}
