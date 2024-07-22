package com.ssafy.a410.game.service;

import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.model.GameState;
import com.ssafy.a410.model.Player;
import com.ssafy.a410.model.Room;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class GameServiceImpl implements GameService {

    private GameState gameState = new GameState();
    private ConcurrentLinkedQueue<String> messageQueue = new ConcurrentLinkedQueue<>();
    private Room room = new Room();

    @Override
    public GameState joinGame(Player player) {
        if (room.isFull()) {
            throw new GameException("Room is full");
        }
        room.addPlayer(player);
        gameState.addPlayer(player);
        return gameState;
    }

    @Override
    public GameState leaveGame(Player player) {
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

    @Override
    public GameState updateGameState(GameState state) {
        this.gameState = state;
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
