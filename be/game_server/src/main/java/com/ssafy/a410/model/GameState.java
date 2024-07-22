package com.ssafy.a410.model;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class GameState {

    private List<Player> players = new ArrayList<>();
    private String phase = "WAIT";
    private boolean gameRunning = false;
    private String team1Role = "HIDE"; // 팀 1의 초기 역할
    private String team2Role = "SEEK"; // 팀 2의 초기 역할

    public void addPlayer(Player player) {
        if (players.size() < 8) {
            players.add(player);
            assignTeam(player);
        }
    }

    public void removePlayer(Player player) {
        players.remove(player);
    }

    public void setPlayerReady(Player player) {
        players.stream()
                .filter(p -> p.getId().equals(player.getId()))
                .forEach(p -> p.setReady(true));
    }

    public boolean isReadyToStart() {
        long readyCount = players.stream().filter(Player::isReady).count();
        return readyCount > players.size() / 2;
    }

    public void switchRoles() {
        if (team1Role.equals("HIDE")) {
            team1Role = "SEEK";
            team2Role = "HIDE";
        } else {
            team1Role = "HIDE";
            team2Role = "SEEK";
        }
    }

    public String getTeamRole(String team) {
        if (team.equals("team1")) {
            return team1Role;
        } else {
            return team2Role;
        }
    }

    private void assignTeam(Player player) {
        long team1Count = players.stream().filter(p -> "team1".equals(p.getTeam())).count();
        long team2Count = players.stream().filter(p -> "team2".equals(p.getTeam())).count();

        if (team1Count <= team2Count) {
            player.setTeam("team1");
        } else {
            player.setTeam("team2");
        }
    }
}
