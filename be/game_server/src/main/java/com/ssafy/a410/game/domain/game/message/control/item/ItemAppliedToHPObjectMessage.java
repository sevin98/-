package com.ssafy.a410.game.domain.game.message.control.item;

import com.ssafy.a410.game.domain.game.Item;
import lombok.Getter;

import java.time.Duration;
import java.util.Map;

@Getter
public class ItemAppliedToHPObjectMessage extends ItemMessage {
    private final String roomId;
    private final String hpObjectId;
    private final String playerId;
    private final Item item;
    private final Duration duration;
    private final String appliedById;

    public ItemAppliedToHPObjectMessage(String roomId, String hpObjectId, String playerId, Item item, Duration duration, String appliedById, String requestId) {
        super(ItemControlType.ITEM_APPLIED_TO_OBJECT,
                Map.of(
                        "roomId", roomId,
                        "hpObjectId", hpObjectId,
                        "playerId", playerId,
                        "item", item,
                        "duration", duration,
                        "appliedById", appliedById
                ),
                requestId);
        this.roomId = roomId;
        this.hpObjectId = hpObjectId;
        this.playerId = playerId;
        this.item = item;
        this.duration = duration;
        this.appliedById = appliedById;
    }
}
