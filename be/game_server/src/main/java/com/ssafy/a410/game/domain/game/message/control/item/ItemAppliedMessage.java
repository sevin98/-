package com.ssafy.a410.game.domain.game.message.control.item;

import com.ssafy.a410.game.domain.game.Item;
import lombok.Getter;

import java.time.Duration;

@Getter
public class ItemAppliedMessage extends ItemMessage {
    private final String roomId;
    private final String playerId;
    private final Item item;
    private final Duration duration;
    private final int newSpeed;

    public ItemAppliedMessage(String roomId, String playerId, Item item, Duration duration, int newSpeed, String requestId) {
        super(ItemControlType.ItemAppliedToPlayer, null, requestId);
        this.roomId = roomId;
        this.playerId = playerId;
        this.item = item;
        this.duration = duration;
        this.newSpeed = newSpeed;
    }
}
