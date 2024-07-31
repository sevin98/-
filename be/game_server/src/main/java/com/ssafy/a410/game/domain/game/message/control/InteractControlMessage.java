package com.ssafy.a410.game.domain.game.message.control;

import com.ssafy.a410.common.domain.message.ControlMessage;

public class InteractControlMessage extends ControlMessage {
    public InteractControlMessage(InteractType type, Object data) {
        super(type.name(), data);
    }
}
