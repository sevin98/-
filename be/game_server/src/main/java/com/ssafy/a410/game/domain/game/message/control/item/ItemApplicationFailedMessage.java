package com.ssafy.a410.game.domain.game.message.control.item;

import com.ssafy.a410.game.domain.game.Item;
import lombok.Getter;

@Getter
public class ItemApplicationFailedMessage extends ItemMessage{
    private final String roomId;
    private final String playerId;
    private final String hpObjectId;
    private final Item item;

    public ItemApplicationFailedMessage(String roomId, String playerId, String hpObjectId, Item item, String requestId) {
        super("ItemApplicationFailed", null, requestId);
        this.roomId = roomId;
        this.playerId = playerId;
        this.hpObjectId = hpObjectId;
        this.item = item;
    }
}
