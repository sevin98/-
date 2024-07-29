package com.ssafy.a410.game.domain.message.game.control;

import com.ssafy.a410.game.domain.Phase;

public record PhaseInfo(
        Phase phase,
        long finishAfterMilliSec
) {
    public static PhaseInfo of(Phase phase) {
        return new PhaseInfo(phase, phase.getDuration());
    }
}
