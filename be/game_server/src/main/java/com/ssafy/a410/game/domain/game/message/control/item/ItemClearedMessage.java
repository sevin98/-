package com.ssafy.a410.game.domain.game.message.control.item;

import lombok.Getter;

import java.time.Duration;

@Getter
public class ItemClearedMessage extends ItemMessage {
    private final String roomId;
    private final String playerId;
    private final String hpObjectId;
    private final Duration duration;
    private final String appliedById;

    public ItemClearedMessage(String roomId, String playerId, String hpObjectId, Duration duration, String appliedById) {
        super(ItemControlType.ITEM_CLEARED, null, null);
        this.roomId = roomId;
        this.playerId = playerId;
        this.hpObjectId = hpObjectId;
        this.duration = duration;
        this.appliedById = appliedById;
    }
}
