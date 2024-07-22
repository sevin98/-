package com.ssafy.a410.model;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class Room {

    private String id;
    private List<Player> players = new ArrayList<>();

    public void addPlayer(Player player) {
        if (players.size() < 8) {
            players.add(player);
        }
    }

    public void removePlayer(Player player) {
        players.remove(player);
    }

    public boolean isFull() {
        return players.size() >= 8;
    }
}
