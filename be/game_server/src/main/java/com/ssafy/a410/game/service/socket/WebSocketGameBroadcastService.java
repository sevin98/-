package com.ssafy.a410.game.service.socket;

import com.ssafy.a410.game.domain.Game;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Team;
import com.ssafy.a410.game.service.GameBroadcastService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class WebSocketGameBroadcastService implements GameBroadcastService {
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void broadcastTo(Game game, Object message) {
        messagingTemplate.convertAndSend(game.getTopic(), message);
    }

    @Override
    public void broadcastTo(Team team, Object message) {
        messagingTemplate.convertAndSend(team.getTopic(), message);
    }

    @Override
    public void unicastTo(Player player, Object message) {
        messagingTemplate.convertAndSend(player.getTopic(), message);
    }
}