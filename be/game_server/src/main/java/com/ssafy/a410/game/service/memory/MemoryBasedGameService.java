package com.ssafy.a410.game.service.memory;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.service.GameService;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MemoryBasedGameService implements GameService {
    private final RoomService roomService;

    public MemoryBasedGameService(RoomService roomService) {
        this.roomService = roomService;
    }

    @Override
    public Optional<Game> findGameByPlayerId(String playerId) {
        // roomService에서 방을 찾아와서 playingGame을 가져온다.
        Room room = roomService.getRoomById(playerId);
        return Optional.ofNullable(room.playingGame);
    }
}
