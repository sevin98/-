package com.ssafy.a410.ranking.controller;

import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.ranking.controller.dto.RankingResp;
import com.ssafy.a410.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping("/wins")
    public List<RankingResp> getRankingByWins() {
        return rankingService.getAllUsersSortedByWins().stream()
                .map(user -> new RankingResp(
                        user.getUserProfile().getNickname(),
                        user.getWins(),
                        user.getCatchCount(),
                        user.getFormattedSurvivalTime()))
                .collect(Collectors.toList());
    }

    @GetMapping("/catch-count")
    public List<RankingResp> getRankingByCatchCount() {
        return rankingService.getAllUsersSortedByCatchCount().stream()
                .map(user -> new RankingResp(
                        user.getUserProfile().getNickname(),
                        user.getWins(),
                        user.getCatchCount(),
                        user.getFormattedSurvivalTime()))
                .collect(Collectors.toList());
    }

    @GetMapping("/survival-time")
    public List<RankingResp> getRankingBySurvivalTime() {
        return rankingService.getAllUsersSortedBySurvivalTime().stream()
                .map(user -> new RankingResp(
                        user.getUserProfile().getNickname(),
                        user.getWins(),
                        user.getCatchCount(),
                        user.getFormattedSurvivalTime()))
                .collect(Collectors.toList());
    }
}
