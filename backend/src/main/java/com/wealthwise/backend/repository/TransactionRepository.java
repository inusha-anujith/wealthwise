package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Custom Query Method: Finds all transactions belonging to a specific user.
     * This is crucial for security, ensuring User A cannot see User B's financial data.
     * SQL generated: "SELECT * FROM transactions WHERE user_id = ?"
     */
    List<Transaction> findByUserId(Long userId);
}