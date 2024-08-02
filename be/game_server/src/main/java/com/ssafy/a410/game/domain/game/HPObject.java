package com.ssafy.a410.game.domain.game;

import com.google.gson.JsonObject;
import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.common.exception.UnhandledException;
import com.ssafy.a410.game.domain.player.Player;
import lombok.Getter;

@Getter
public class HPObject extends GameObject {
    // 숨어있거나, 아이템을 숨긴 플레이어
    private Player player;
    // 플레이어가 숨어있는 경우 Item = null
    private Item appliedItem;

    public HPObject(JsonObject jsonObject) {
        super(jsonObject);
        this.player = null;
        this.appliedItem = null;
    }

    // HPObject가 비어있는지 확인하는 함수
    public boolean isEmpty() {
        return this.player == null && this.appliedItem == null;
    }

    // 플레이어를 숨기는 것을 해제하는 함수
    public void unhidePlayer() {
        this.player = null;
    }

    // 아이템을 해제하는 함수
    public void removeItem() {
        this.appliedItem = null;
    }

    // 플레이어 숨는 함수
    public void hidePlayer(Player player) {
        extracted();
        if (this.getId() == null) {
            throw new UnhandledException("Invalid object ID");
        }
        this.player = player;
    }

    // 해당 HP에 누군가가 있거나 어떤 아이템이 적용되어있다면.
    private void extracted() {
        if (!isEmpty()) {
            throw new UnhandledException("The object already contains another player or item.");
        }
    }

    // 플레이어 추출
    public Player extractHidingPlayer() {
        Player foundPlayer = this.player;
        unhidePlayer();
        return foundPlayer;
    }

    // 아이템 추출
    public Item extractItem() {
        Item foundItem = this.appliedItem;
        removeItem();
        return foundItem;
    }

    // 해당 오브젝트에 대해 탐색
    public boolean explore(Player exploringPlayer) {
        if (this.player != null)
            return true; // 플레이어를 찾은 경우

        return false; // 빈 오브젝트인 경우
    }
}

