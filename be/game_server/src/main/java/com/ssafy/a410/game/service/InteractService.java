package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.game.message.request.InteractExploreReq;
import com.ssafy.a410.game.domain.game.message.request.InteractHideReq;

public interface InteractService {

    void hideOnHPObject(InteractHideReq interactHideReq);

    void exploreObject(InteractExploreReq interactExploreReq);
}