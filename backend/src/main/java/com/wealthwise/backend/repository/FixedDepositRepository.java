package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.FixedDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// Standard DAO interface for database operations on Fixed Deposits.
@Repository
public interface FixedDepositRepository extends JpaRepository<FixedDeposit, Long> {
    List<FixedDeposit> findByUserId(Long userId);
}