package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.InvestmentTaxRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface InvestmentTaxRuleRepository extends JpaRepository<InvestmentTaxRule, Long> {

    Optional<InvestmentTaxRule> findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDesc(LocalDate date);

    Optional<InvestmentTaxRule> findFirstByOrderByEffectiveFromAsc();
}