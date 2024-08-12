package com.ssafy.a410.ranking.service;

import com.ssafy.a410.ranking.controller.dto.RankingResp;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RankingService {
    Page<RankingResp> getAllUsersSortedByWins(Pageable pageable);
    Page<RankingResp> getAllUsersSortedByCatchCount(Pageable pageable);
    Page<RankingResp> getAllUsersSortedBySurvivalTime(Pageable pageable);
    RankingResp getMyRanking(String userId);
}
