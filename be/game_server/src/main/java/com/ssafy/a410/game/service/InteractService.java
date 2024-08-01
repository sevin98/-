package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.game.message.request.InteractExploreReq;

public interface InteractService {

    void hideOnHPObject(String roomId, String playerId, String objectId);

    void exploreObject(InteractExploreReq interactExploreReq);
}