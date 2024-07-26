package com.ssafy.a410.game.domain;

import com.ssafy.a410.common.exception.handler.GameException;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Player implements Subscribable {
    // 플레이어 식별자
    private final String id;
    // 플레이어 이름
    private final String nickname;
    // 플레이어가 속한 방
    private final Room room;
    // 게임 시작 준비 여부
    private boolean readyToStart;
    // 위치 및 방향
    private int x;
    private int y;
    private PlayerDirection direction;
    // 움직일 수 없음을 표시
    private boolean isFreeze;

    public Player(String id, String nickname, Room room) {
        this.id = id;
        this.nickname = nickname;
        this.room = room;
        this.readyToStart = false;
    }

    public void setInitialPosition(int x, int y, PlayerDirection direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.isFreeze = false;
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
        if(this.readyToStart) {
            throw new GameException("Player is already ready to start");
        }
        this.readyToStart = true;
    }

    @Override
    public String getTopic() {
        return "/topic/rooms/" + room.getRoomNumber() + "/players/" + id;
    }

    public void freeze() {
        this.isFreeze = true;
    }

    public void unfreeze() {
        this.isFreeze = false;
    }
}
