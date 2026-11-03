package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);

    // Newest first, so the dashboard's "recent activity" list is correct.
    List<Transaction> findByUserIdOrderByTransactionDateDescIdDesc(Long userId);

    // Finds a record only if this user owns it.
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);
}