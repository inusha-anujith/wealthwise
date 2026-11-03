package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdOrderByTransactionDateDescIdDesc(Long userId);

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    void deleteBySourceTypeAndSourceId(TransactionSource sourceType, Long sourceId);
}