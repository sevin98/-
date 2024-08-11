package com.ssafy.a410.game.domain.game.message.control.item;

public enum ItemControlType {
    ItemCleared, // 아이템 효과 제거
    ItemAppliedToPlayer, // 아이템 사용 성공
    ItemApplicationFailedToPlayer, // 플레이어에게 아이템 사용 실패
    ItemApplicationFailedToObject, // 아이템 사용 실패
    ItemAppliedToHPObject, // 아이템을 오브젝트에 사용

}
