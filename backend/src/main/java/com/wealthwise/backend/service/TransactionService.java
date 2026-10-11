package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.FinancialAdvice;
import java.math.BigDecimal;
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
    // Retrieves a complete history of transactions for a specific user
    public List<Transaction> getUserTransactions(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

     /*Implementing the Delete portion of the CRUD lifecycle for cash flow.
     * I am using Spring Data JPA's built-in .deleteById() method to remove the record 
     * from the PostgreSQL database, ensuring my financial calculations remain accurate.
     */
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    /*
     * INTERVIEW NOTE: This is the core advisory algorithm. It aggregates data on the server side 
     * to prevent the frontend from doing heavy lifting, keeping the client-side fast.
     */
    public FinancialAdvice analyzeCashFlow(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if ("INCOME".equals(t.getType().toString())) {
                totalIncome = totalIncome.add(t.getAmount());
            } else if ("EXPENSE".equals(t.getType().toString())) {
                totalExpense = totalExpense.add(t.getAmount());
            }
        }

        FinancialAdvice advice = new FinancialAdvice();
        
        // Real-world validation logic. Comparing BigDecimals requires .compareTo().
        if (totalExpense.compareTo(totalIncome) > 0) {
            advice.setStatus("WARNING");
            advice.setMessage("CRITICAL: You are living with negative savings. Please reduce unnecessary expenses immediately.");
        } else {
            advice.setStatus("HEALTHY");
            advice.setMessage("Great job! Your cash flow is positive. Consider deploying excess cash into the Stock Simulator or Fixed Deposits.");
        }
        
        return advice;
    }
       
}