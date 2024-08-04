package com.ssafy.a410.ranking.service;

import com.ssafy.a410.auth.model.entity.AuthInfoEntity;

import java.util.List;

public interface RankingService {
    List<AuthInfoEntity> getAllUsersSortedByWins();
    List<AuthInfoEntity> getAllUsersSortedByCatchCount();
    List<AuthInfoEntity> getAllUsersSortedBySurvivalTime();
}
