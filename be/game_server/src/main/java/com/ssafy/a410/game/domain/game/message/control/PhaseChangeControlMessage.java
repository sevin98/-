package com.ssafy.a410.game.domain.game.message.control;

import com.ssafy.a410.game.domain.game.Phase;

public class PhaseChangeControlMessage extends GameControlMessage {
    public PhaseChangeControlMessage(Phase phase) {
        super(GameControlType.PHASE_CHANGE, PhaseInfo.of(phase));
    }
}
