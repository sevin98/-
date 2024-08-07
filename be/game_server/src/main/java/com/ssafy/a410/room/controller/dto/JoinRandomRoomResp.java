package com.ssafy.a410.room.controller.dto;

import com.ssafy.a410.socket.controller.dto.SubscriptionInfoResp;

public record JoinRandomRoomResp(
        String roomId,
        SubscriptionInfoResp roomSubscriptionInfo,
        SubscriptionInfoResp playerSubscriptionInfo
) {
}
