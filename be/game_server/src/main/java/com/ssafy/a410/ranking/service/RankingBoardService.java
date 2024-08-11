package com.ssafy.a410.ranking.service;

import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import com.ssafy.a410.auth.model.repository.UserProfileRepository;
import com.ssafy.a410.common.exception.ErrorDetail;
import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.ranking.controller.dto.RankingResp;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RankingBoardService implements RankingService {

    private final UserProfileRepository userProfileRepository;

    @Override
    public Page<RankingResp> getAllUsersSortedByWins(Pageable pageable) {
        return userProfileRepository.findAllByOrderByWinsDesc(pageable).map(user ->
                new RankingResp(
                        user.getNickname(),
                        user.getWins(),
                        user.getCatchCount(),
                        user.getFormattedSurvivalTime()
                )
        );
    }

    @Override
    public Page<RankingResp> getAllUsersSortedByCatchCount(Pageable pageable) {
        return userProfileRepository.findAllByOrderByCatchCountDesc(pageable).map(user ->
                new RankingResp(
                        user.getNickname(),
                        user.getWins(),
                        user.getCatchCount(),
                        user.getFormattedSurvivalTime()
                )
        );
    }

    @Override
    public Page<RankingResp> getAllUsersSortedBySurvivalTime(Pageable pageable) {
        return userProfileRepository.findAllByOrderBySurvivalTimeInSecondsDesc(pageable).map(user ->
                new RankingResp(
                        user.getNickname(),
                        user.getWins(),
                        user.getCatchCount(),
                        user.getFormattedSurvivalTime()
                )
        );
    }

    @Override
    public RankingResp getMyRanking(String userId) {
        UserProfileEntity user = userProfileRepository.findByUuid(userId)
                .orElseThrow(() -> new ResponseException(ErrorDetail.PLAYER_NOT_FOUND));
        return new RankingResp(
                user.getNickname(),
                user.getWins(),
                user.getCatchCount(),
                user.getFormattedSurvivalTime()
        );
    }
}