package com.ssafy.a410.ranking.service;

import com.ssafy.a410.auth.model.entity.AuthInfoEntity;
import com.ssafy.a410.auth.model.repository.AuthInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RankingBoardService implements RankingService{

    private final AuthInfoRepository authInfoRepository;

    @Override
    public List<AuthInfoEntity> getAllUsersSortedByWins() {
        return authInfoRepository.findAll(Sort.by(Sort.Direction.DESC, "wins"));
    }

    @Override
    public List<AuthInfoEntity> getAllUsersSortedByCatchCount() {
        return authInfoRepository.findAll(Sort.by(Sort.Direction.DESC, "catchCount"));
    }

    @Override
    public List<AuthInfoEntity> getAllUsersSortedBySurvivalTime() {
        return authInfoRepository.findAll(Sort.by(Sort.Direction.DESC, "survivalTimeInSeconds"));
    }
}
