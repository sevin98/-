package com.ssafy.a410.game.service.memory;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.message.control.GameInfo;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.service.GameService;
import com.ssafy.a410.game.service.MessageBroadcastService;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Service
public class MemoryBasedGameService implements GameService {
    private final RoomService roomService;
    private final MessageBroadcastService messageBroadcastService;

    @Override
    public Optional<Game> findGameByPlayerId(String playerId) {
        // roomService에서 방을 찾아와서 playingGame을 가져온다.
        Room room = roomService.getRoomById(playerId);
        return Optional.ofNullable(room.playingGame);
    }

    @Override
    public void sendGameInfoToPlayer(String roomId, String userProfileUuid) {
        // 해당 방에 플레이어가 있는지 먼저 확인하고
        Room targetRoom = roomService.getRoomById(roomId);
        Player player = targetRoom.getPlayerWith(userProfileUuid);

        // 게임의 정보를 해당 플레이어의 채널로 전송
        GameInfo gameInfo = new GameInfo(targetRoom.playingGame);
        messageBroadcastService.unicastTo(player, gameInfo);
    }
}
