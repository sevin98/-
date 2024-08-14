package com.ssafy.a410.game.domain.game.message.control.item;

import com.ssafy.a410.game.domain.game.Item;
import lombok.Getter;

import java.util.Map;

@Getter
public class ItemApplicationFailedToPlayerMessage extends ItemMessage {
    private final String roomId;
    private final String playerId;
    private final Item item;

    public ItemApplicationFailedToPlayerMessage(String roomId, String playerId, Item item, String requestId) {
        super(ItemControlType.ITEM_APPLICATION_FAILED_TO_PLAYER,
                Map.of(
                        "roomId", roomId,
                        "playerId", playerId,
                        "item", item
                ),
                requestId);
        this.roomId = roomId;
        this.playerId = playerId;
        this.item = item;
    }
}
