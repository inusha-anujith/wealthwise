package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdOrderByTransactionDateDescIdDesc(Long userId);

    List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDescIdDesc(
            Long userId, LocalDate start, LocalDate end
    );

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    void deleteBySourceTypeAndSourceId(TransactionSource sourceType, Long sourceId);

    // The database adds up the totals, so it doesn't load every row into Java.
    @Query("""
            SELECT t.category AS category, SUM(t.amount) AS total
            FROM Transaction t
            WHERE t.user.id = :userId AND t.transactionDate BETWEEN :start AND :end
            GROUP BY t.category
            """)
    List<CategoryTotal> sumByCategory(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
}