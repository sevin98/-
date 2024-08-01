package com.ssafy.a410.game.domain.game.message.control.interact;

import lombok.Getter;

@Getter
public class InteractExploreMessage extends InteractControlMessage {

    private final InteractExploreInfo data;

    public InteractExploreMessage(InteractType type, String roomId, String playerId, String objectId, String foundPlayerId) {
        super(type, null);
        this.data = new InteractExploreInfo(roomId, playerId, objectId, foundPlayerId);
    }

    // 찾기 성공 했을떄 등장할 메시지
    public static InteractExploreMessage successMessage(String roomId, String playerId, String objectId, String foundPlayerId) {
        return new InteractExploreMessage(InteractType.INTERACT_EXPLORE_SUCCESS, roomId, playerId, objectId, foundPlayerId);
    }

    // 찾기 실패 했을떄 등장할 메시지
    public static InteractExploreMessage failureMessage(String roomId, String playerId, String objectId) {
        return new InteractExploreMessage(InteractType.INTERACT_EXPLORE_FAIL, playerId, roomId, objectId, "NONE");
    }
}
