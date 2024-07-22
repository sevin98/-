package com.ssafy.a410.game.service.dto;

import com.ssafy.a410.model.Player;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class GameStateDTO {

    private String phase;
    private List<Player> players;
}
