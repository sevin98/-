package com.ssafy.a410.game.domain.game.message.control.interact;

import com.ssafy.a410.game.domain.game.Item;
import lombok.Getter;
import java.util.Map;

@Getter
public class InteractHideFailMessage extends InteractHideMessage {
    private final String roomId;
    private final String playerId;
    private final String objectId;
    private final String item;

    public InteractHideFailMessage(String roomId, String playerId, String objectId, Item item) {
        super(InteractType.INTERACT_HIDE_FAIL, Map.of(
                "roomId", roomId,
                "playerId", playerId,
                "objectId", objectId,
                "item", item != null ? item.name() : "NONE"
        ));
        this.roomId = roomId;
        this.playerId = playerId;
        this.objectId = objectId;
        this.item = item != null ? item.name() : "NONE";
    }
}
