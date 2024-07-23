package com.ssafy.a410.game.service;

import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.game.domain.GameState;
import com.ssafy.a410.game.domain.Player;
import com.ssafy.a410.game.domain.Room;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class MemoryBasedRoomService implements RoomService {
    private final ConcurrentLinkedQueue<String> messageQueue = new ConcurrentLinkedQueue<>();
    private final Room room = new Room("1");
    private final GameState gameState = new GameState();

    @Override
    public GameState joinGame(Player player) {
        if (room.canJoin(player)) {
            throw new GameException("Room is full");
        }
        room.addPlayer(player);
        gameState.addPlayer(player);
        return gameState;
    }

    @Override
    public GameState leaveGame(Player player) {
        if (room.isIn(player)) {
            throw new GameException("Player is not in room");
        }
        room.removePlayer(player);
        gameState.removePlayer(player);
        return gameState;
    }

    @Override
    public GameState readyPlayer(Player player) {
        gameState.setPlayerReady(player);
        if (gameState.isReadyToStart()) {
            startGame();
        }
        return gameState;
    }

    private void startGame() {
        new Thread(() -> {
            try {
                //대기시간 전부 다 일단 5초로 통일
                Thread.sleep(5000);
                gameState.setGameRunning(true);
                while (gameState.isGameRunning()) {

                    gameState.setPhase("HIDE");
                    Thread.sleep(5000);

                    gameState.setPhase("SEEK");
                    Thread.sleep(5000);
                    gameState.switchRoles();
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
}
