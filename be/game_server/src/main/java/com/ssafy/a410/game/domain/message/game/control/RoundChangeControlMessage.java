package com.ssafy.a410.game.domain.message.game.control;

public class RoundChangeControlMessage extends GameControlMessage {
    public RoundChangeControlMessage(int nextRound, int totalRound) {
        super(GameControlType.ROUND_CHANGE, new RoundInfo(nextRound, totalRound));
    }
}
