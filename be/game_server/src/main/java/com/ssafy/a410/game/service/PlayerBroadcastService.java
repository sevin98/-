package com.ssafy.a410.game.service;

import com.ssafy.a410.game.service.dto.PlayerPositionVO;

// 특정 조건을 만족하는 사용자에게 메시지를 전파하기 위한 서비스
public interface PlayerBroadcastService {
    // roomId를 방 식별자로 가지는 방에 참여하고 있는 사용자들이 주변 사용자들의 현재 위치를 구독
    void broadcastPlayerPosition(String roomId, PlayerPositionVO vo, String requestId);
}
