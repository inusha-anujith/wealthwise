package com.wealthwise.backend.dto;

import com.wealthwise.backend.entity.TransactionType;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

// The only fields a client may send when creating a transaction.
public record TransactionRequest(
        @NotNull(message = "Transaction type is required")
        TransactionType type,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        @Digits(integer = 13, fraction = 2, message = "Amount can have up to 13 digits and 2 decimal places")
        BigDecimal amount,

        @NotBlank(message = "Category is required")
        @Size(max = 100, message = "Category must be 100 characters or fewer")
        String category,

        @NotNull(message = "Transaction date is required")
        LocalDate transactionDate,

        @Size(max = 500, message = "Description must be 500 characters or fewer")
        String description
) {
}