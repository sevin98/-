package com.ssafy.a410.game.service.memory;

import com.ssafy.a410.game.domain.Game;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.service.OutGameService;
import org.springframework.stereotype.Service;

@Service
public class MemoryBasedOutGameService implements OutGameService {
    @Override
    public Game getGame(Room room) {
        return new Game(room);
    }

    @Override
    public void finishGame(Game gameToFinish) {
        // TODO : 게임 종료 처리
    }
}
