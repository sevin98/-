package com.ssafy.a410.game.service.memory;

import com.ssafy.a410.game.domain.Game;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;
import com.ssafy.a410.game.service.GameService;
import com.ssafy.a410.game.service.RoomService;
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
        Optional<Room> room = roomService.findRoomByPlayerId(playerId);
        return Optional.ofNullable(room.get().playingGame);
    }

    @Override
    public void removeGame(Room room) {
        // 게임을 포함하고 있는 방에서, 게임을 제거
        room.getPlayingGame()
    }

    @Override
    public void notifyDisconnection(Player player) {

    }

}
