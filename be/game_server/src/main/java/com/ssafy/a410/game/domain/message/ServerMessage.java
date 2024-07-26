package com.ssafy.a410.game.domain.message;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ServerMessage {
    private final Object data;
}
