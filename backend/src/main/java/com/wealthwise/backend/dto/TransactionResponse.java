package com.wealthwise.backend.dto;

import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionSource;
import com.wealthwise.backend.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        TransactionType type,
        BigDecimal amount,
        String category,
        LocalDate transactionDate,
        String description,
        TransactionSource sourceType
) {
    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getCategory(),
                transaction.getTransactionDate(),
                transaction.getDescription(),
                transaction.getSourceType()
        );
    }
}