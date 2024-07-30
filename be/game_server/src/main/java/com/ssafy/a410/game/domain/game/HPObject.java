package com.ssafy.a410.game.domain.game;

import com.google.gson.JsonObject;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HPObject extends GameObject {
    // 숨어있는 플레이어의 Id, 적용된 아이템 이름
    private String HidingPlayerId;
    private String AppliedItemName;

    public HPObject(JsonObject jsonObject) {
        super(jsonObject);
        this.HidingPlayerId = null;
        this.AppliedItemName = null;
    }
}
