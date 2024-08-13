package com.ssafy.a410.game.domain.game.message.control.item;

import com.ssafy.a410.game.domain.game.Item;
import lombok.Getter;

import java.util.Map;

@Getter
public class ItemApplicationFailedToObjectMessage extends ItemMessage {
    private final String roomId;
    private final String playerId;
    private final String hpObjectId;
    private final Item item;

    public ItemApplicationFailedToObjectMessage(String roomId, String playerId, String hpObjectId, Item item, String requestId) {
        super(ItemControlType.ITEM_APPLICATION_FAILED_TO_OBJECT,
                Map.of(
                        "roomId", roomId,
                        "playerId", playerId,
                        "hpObjectId", hpObjectId,
                        "item", item
                ),
                requestId);
        this.roomId = roomId;
        this.playerId = playerId;
        this.hpObjectId = hpObjectId;
        this.item = item;
    }
}
