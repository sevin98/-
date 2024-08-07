package com.ssafy.a410.game.domain.game.message.control;

import lombok.Getter;

import java.awt.*;
import java.util.List;

@Getter
public class SafeZoneUpdateMessage extends GameControlMessage {
    public SafeZoneUpdateMessage(List<Point> corners) {
        super(GameControlType.SAFE_ZONE_UPDATE, corners);
    }
}