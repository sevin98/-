package com.ssafy.a410.game.service.memory;

import com.ssafy.a410.game.domain.Game;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.service.OutGameService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class MemoryBasedOutGameService implements OutGameService {
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public Game getGame(Room room) {
        return new Game(room, messagingTemplate);
    }

    @Override
    public void finishGame(Game gameToFinish) {
        // TODO : 게임 종료 처리
    }
}
