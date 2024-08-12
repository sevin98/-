package com.ssafy.a410.ranking.controller;

import com.ssafy.a410.ranking.controller.dto.RankingResp;
import com.ssafy.a410.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    @GetMapping("/wins")
    public Page<RankingResp> getRankingByWins(Pageable pageable) {
        return rankingService.getAllUsersSortedByWins(pageable);
    }

    @GetMapping("/catch-count")
    public Page<RankingResp> getRankingByCatchCount(Pageable pageable) {
        return rankingService.getAllUsersSortedByCatchCount(pageable);
    }

    @GetMapping("/survival-time")
    public Page<RankingResp> getRankingBySurvivalTime(Pageable pageable) {
        return rankingService.getAllUsersSortedBySurvivalTime(pageable);
    }

    // 본인의 랭킹 조회
    @GetMapping("/me")
    public RankingResp getMyRanking(Principal principal) {
        return rankingService.getMyRanking(principal.getName());
    }
}