package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.PayrollRuleSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface PayrollRuleSetRepository extends JpaRepository<PayrollRuleSet, Long> {

    // Finds the newest rules that had already started on the given date.
    Optional<PayrollRuleSet> findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDesc(LocalDate date);
}