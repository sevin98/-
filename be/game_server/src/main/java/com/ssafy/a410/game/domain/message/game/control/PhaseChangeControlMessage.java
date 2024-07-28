package com.ssafy.a410.game.domain.message.game.control;

import com.ssafy.a410.game.domain.Phase;

public class PhaseChangeControlMessage extends GameControlMessage {
    public PhaseChangeControlMessage(Phase phase) {
        super(GameControlType.PHASE_CHANGE, PhaseInfo.of(phase));
    }
}
