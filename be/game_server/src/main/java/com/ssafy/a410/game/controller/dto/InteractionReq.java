package com.ssafy.a410.game.controller.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InteractionReq {

    private String playerId;
    private String objectId;

    public InteractionReq() {}

}
