package com.ssafy.a410.game.domain.game.message.control.item;

import com.ssafy.a410.game.domain.game.Item;
import lombok.Getter;

@Getter
public class ItemApplicationFailedToPlayerMessage extends ItemMessage{
        private final String roomId;
        private final String playerId;
        private final Item item;

        public ItemApplicationFailedToPlayerMessage(String roomId, String playerId, Item item, String requestId) {
            super(ItemControlType.ItemApplicationFailedToPlayer, null, requestId);
            this.roomId = roomId;
            this.playerId = playerId;
            this.item = item;
        }
    }
