package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.Game;
import com.ssafy.a410.game.domain.Room;
import org.springframework.stereotype.Service;

@Service
public class MemoryBasedOutGameService implements OutGameService {
    @Override
    public Game getGame(Room room) {
        Game newGame = Game.createNewGame(room);
        return null;
    }

    @Override
    public void finishGame(Game gameToFinish) {

    }
}
