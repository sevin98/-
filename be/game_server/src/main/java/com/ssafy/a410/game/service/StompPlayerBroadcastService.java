package com.ssafy.a410.game.service;

import com.ssafy.a410.common.controller.dto.SocketClientResponseVO;
import com.ssafy.a410.game.controller.dto.PlayerPositionVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

import static com.ssafy.a410.common.StringUtil.getTopicUrl;

@Slf4j
@RequiredArgsConstructor
@Service
public class StompPlayerBroadcastService implements PlayerBroadcastService {
    private static final String PLAYER_POSITION_TOPIC = "/rooms/{roomId}/players/position";

    private final SimpMessagingTemplate simpMessagingTemplate;

    @Override
    public void broadcastPlayerPosition(String roomId, PlayerPositionVO vo, String requestId) {
        String topicUrl = getTopicUrl(PLAYER_POSITION_TOPIC, Map.of("roomId", roomId));
        SocketClientResponseVO<PlayerPositionVO> response = new SocketClientResponseVO<>(requestId, vo);
        simpMessagingTemplate.convertAndSend(topicUrl, response);
    }
}
