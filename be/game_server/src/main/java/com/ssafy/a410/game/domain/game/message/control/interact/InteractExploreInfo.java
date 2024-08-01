package com.ssafy.a410.game.domain.game.message.control.interact;

public record InteractExploreInfo(String roomId, String playerId, String objectId, String foundPlayerId) {

    public InteractExploreInfo{
        if(foundPlayerId == null){
            // null값으로 들어올때 NONE으로 기본값처리
            foundPlayerId = "NONE";
        }
    }
}