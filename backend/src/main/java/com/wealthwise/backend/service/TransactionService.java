package com.wealthwise.backend.service;

import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionType;
import com.wealthwise.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

// Designates this class as the business logic layer in the Spring context.
@Service
// Generates a constructor for dependency injection of final fields.
@RequiredArgsConstructor
public class TransactionService {

    // Immutable reference to the data access layer.
    private final TransactionRepository transactionRepository;

    // Ensures ACID compliance; rolls back database changes if an error occurs during execution.
    @Transactional
    public Transaction recordTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    // Aggregates transaction amounts to calculate the user's net balance.
    public BigDecimal calculateNetSavings(Long userId) {
        List<Transaction> userTransactions = transactionRepository.findByUserId(userId);
        
        BigDecimal balance = BigDecimal.ZERO;

        for (Transaction t : userTransactions) {
            if (t.getType() == TransactionType.INCOME) {
                balance = balance.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                balance = balance.subtract(t.getAmount());
            }
        }
        
        return balance;
    }
}