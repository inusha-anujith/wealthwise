package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.TaxBracket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaxBracketRepository extends JpaRepository<TaxBracket, Long> {

    List<TaxBracket> findByRuleSetIdOrderByLowerBoundAsc(Long ruleSetId);
}