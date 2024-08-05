package com.ssafy.a410.game.domain.game.message.control.item;

import com.ssafy.a410.game.domain.game.Item;
import lombok.Getter;

import java.time.Duration;

@Getter
public class ItemAppliedToHPObjectMessage extends ItemMessage {
    private final String roomId;
    private final String hpObjectId;
    private final String playerId;
    private final Item item;
    private final Duration duration;
    private final String appliedById;

    public ItemAppliedToHPObjectMessage(String roomId, String hpObjectId, String playerId, Item item, Duration duration, String appliedById, String requestId) {
        super("ItemAppliedToHPObject", null, requestId);
        this.roomId = roomId;
        this.hpObjectId = hpObjectId;
        this.playerId = playerId;
        this.item = item;
        this.duration = duration;
        this.appliedById = appliedById;
    }
}
