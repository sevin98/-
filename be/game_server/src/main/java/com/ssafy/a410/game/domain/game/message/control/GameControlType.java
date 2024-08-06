package com.ssafy.a410.game.domain.game.message.control;

public enum GameControlType {
    GAME_START, // 게임 시작
    GAME_INFO, // 게임 정보
    ROUND_CHANGE, // 라운드 전환
    PHASE_CHANGE, // 페이즈 전환
    PLAYER_DISCONNECTED, // 유저 이탈
    SAFE_ZONE_UPDATE, // 안전 구역 업데이트
    ELIMINATION, // 사용자 탈락

}
