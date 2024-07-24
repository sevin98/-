package com.ssafy.a410.game.domain;

import com.ssafy.a410.common.exception.handler.GameException;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Player {
    // 플레이어 식별자
    private final String id;
    // 플레이어 이름
    private final String nickname;
    // 게임 시작 준비 여부
    private boolean readyToStart;

    public Player(String id, String nickname) {
        this.id = id;
        this.nickname = nickname;
        this.readyToStart = false;
    }

    // 방에 참가하기
    public void joinTo(Room room) {
        if (!this.canJoinTo(room)) {
            throw new GameException("Cannot join to room");
        }
        room.addPlayer(this);
    }

    // 방에 참가 가능한지 확인
    public boolean canJoinTo(Room room) {
        return !room.isFull() && !room.has(this);
    }

    // 방에서 나가기
    public void leaveFrom(Room room) {
        if (!this.isIn(room)) {
            throw new GameException("Player is not in room");
        }
        // 준비 상태 해제시키고
        this.readyToStart = false;
        // 방에서 플레이어 제거
        room.removePlayer(this);
    }

    // 방에 있는지 확인
    public boolean isIn(Room room) {
        return room.has(this);
    }

    // 게임 시작 준비 상태로 변경
    public void setReady() {
        this.readyToStart = true;
    }
}
