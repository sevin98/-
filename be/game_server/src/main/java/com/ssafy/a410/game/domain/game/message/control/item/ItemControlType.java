package com.ssafy.a410.game.domain.game.message.control.item;

public enum ItemControlType {
    ItemCleared, // 아이템 효과 제거
    ItemApplied, // 아이템 사용 성공
    ItemApplicationFailed, // 아이템 사용 실패
    ItemAppliedToHPObject, // 아이템을 오브젝트에 사용

}
