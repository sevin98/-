package com.ssafy.a410.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GameEvent {

    private String eventType;
    private String playerId;
    private String message;
}
