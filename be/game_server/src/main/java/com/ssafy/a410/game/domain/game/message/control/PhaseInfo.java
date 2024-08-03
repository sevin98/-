package com.ssafy.a410.game.domain.game.message.control;

import com.ssafy.a410.game.domain.game.Phase;

public record PhaseInfo(
        Phase phase,
        long finishAfterMilliSec
) {
    public static PhaseInfo of(Phase phase) {
        return new PhaseInfo(phase, phase.getDuration());
    }
}
