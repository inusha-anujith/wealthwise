package com.wealthwise.backend.dto;

import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

// The only fields the API returns. The User entity is deliberately left out.
public record TransactionResponse(
        Long id,
        TransactionType type,
        BigDecimal amount,
        String category,
        LocalDate transactionDate,
        String description
) {
    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getCategory(),
                transaction.getTransactionDate(),
                transaction.getDescription()
        );
    }
}