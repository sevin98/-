package com.ssafy.a410.game.domain.player;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.auth.service.jpa.JPAUserService;
import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.game.domain.Pos;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;
import lombok.Setter;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

import static com.ssafy.a410.common.exception.ErrorDetail.PLAYER_ALREADY_READY;

@Getter
@Setter
public class Player extends Subscribable {
    // 플레이어 식별자
    private final String id;
    // 플레이어 이름
    private final String nickname;
    // 플레이어가 속한 방
    private final Room room;
    // 게임 시작 준비 여부
    private boolean readyToStart;
    // 위치
    private Pos pos;
    // 방향
    private PlayerDirection direction;
    // 움직일 수 없음을 표시
    private boolean isFreeze;
    // 플레이어가 살아있는 지 여부
    private boolean isEliminated;
    // 탐색 카운트
    private int seekCount;
    // 킬카운트
    private int catchCount;
    // 생존 시간 시작 시점
    private LocalDateTime startTime;
    // 생존 시간 종료 시점
    private LocalDateTime eliminationTime;
    // 해당 플레이어의 플레이타임
    private Duration playTime;
    // 봇 여부
    private boolean isBot;

    public Player(UserProfile userProfile, Room room) {
        this(userProfile.getUuid(), userProfile.getNickname(), room);
    }

    public Player(String id, String nickname, Room room) {
        this.id = id;
        this.nickname = nickname;
        this.room = room;
        this.readyToStart = false;
        this.pos = new Pos(0, 0);
        this.seekCount = 0;
        this.catchCount = 0;
        this.isBot = false;
    }

    // 봇 생성자
    // TODO : id / nickname의 경우 수정할 경우 auth 통해서 받아오는 걸로
    public Player(Room room, boolean isBot){
        // 나중에 uuid로 봇을 구분해서 움직이는 등의 게임 진행을 해야할 일이 있을까..?
        this.id = UUID.randomUUID().toString();
        // 랜덤 닉네임을 배정해줘야 하는가?
        this.nickname = "bot";
        this.room = room;
        this.pos = new Pos(0, 0);
        this.seekCount = 0;
        this.catchCount = 0;
        this.isBot = isBot;
    }

    public void setInitialPosition(double x, double y, PlayerDirection direction) {
        this.pos.setX(x);
        this.pos.setY(y);
        this.direction = direction;
        this.isFreeze = false;
    }

    // 방에 있는지 확인
    public boolean isIn(Room room) {
        return room.has(this);
    }

    // 게임 시작 준비 상태로 변경
    public void setReady() {
        if (this.readyToStart) {
            throw new ResponseException(PLAYER_ALREADY_READY);
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

    public void setX(double x) {
        this.pos.setX(x);
    }

    public void setY(double y) {
        this.pos.setY(y);
    }

    public void eliminate() {
        this.isEliminated = true;
        // eliminate 당한시간 기록
        this.eliminationTime = LocalDateTime.now();
    }

    public void increaseCatchCount() { this.catchCount++; }

    // 시작 시간 할당
    public void setPlayerStartTime(){
        this.startTime = LocalDateTime.now();
    }

    // 생존 시간 구하기
    public void getSurvivalTimeInSeconds(){

        // 탈락되었다면, 탈락된 시간, 게임이 종료될 때 까지 살아남았다면 DateTimeNow 가 endTime
        LocalDateTime endTime = this.isEliminated ? this.eliminationTime : LocalDateTime.now();
        this.playTime = Duration.between(startTime, endTime);
    }

    // 탐색 카운트 증가
    public void incrementSeekCount() {
        this.seekCount++;
    }

    // 탐색 카운트 초기화
    public void initSeekCount() {
        this.seekCount = 0;
    }

    // 방 재참가시 플레이어 초기화
    public void reset() {
        this.readyToStart = false;
        this.isEliminated = false;
        this.seekCount = 0;
        this.catchCount = 0;
        this.startTime = null;
        this.eliminationTime = null;
        this.playTime = null;
    }
}
