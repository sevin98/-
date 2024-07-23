package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.Game;
import com.ssafy.a410.game.domain.Room;

// 게임 실행, 진행, 종료와 관련된 서비스
public interface OutGameService {
    // 주어진 room의 멤버로 실행할 준비가 된 게임을 받아 온다.
    Game getGame(Room room);

    // 주어진 게임을 종료시킨다.
    void finishGame(Game gameToFinish);
}
