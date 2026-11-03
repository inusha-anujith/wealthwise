package com.wealthwise.backend.dto;

import com.wealthwise.backend.entity.TransactionCategory;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotNull(message = "Category is required")
        TransactionCategory category,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be greater than zero")
        @Digits(integer = 13, fraction = 2, message = "Amount can have up to 13 digits and 2 decimal places")
        BigDecimal amount,

        @NotNull(message = "Transaction date is required")
        LocalDate transactionDate,

        @Size(max = 500, message = "Description must be 500 characters or fewer")
        String description
) {
}