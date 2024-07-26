package com.ssafy.a410.game.domain.message;

public enum GamePlayerControlType {
    FREEZE, // 플레이어가 움직이지 않도록 함
    UNFREEZE, // 플레이어가 움직일 수 있도록 함
    COVER_SCREEN, // 화면 가리기
    UNCOVER_SCREEN, // 화면 가리기 해제
}
