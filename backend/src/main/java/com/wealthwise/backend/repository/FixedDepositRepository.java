package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.FixedDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FixedDepositRepository extends JpaRepository<FixedDeposit, Long> {

    List<FixedDeposit> findByUserId(Long userId);

    Optional<FixedDeposit> findByIdAndUserId(Long id, Long userId);
}