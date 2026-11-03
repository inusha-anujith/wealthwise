package com.wealthwise.backend.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DividendRequest(
        @NotNull(message = "Asset is required")
        Long assetId,

        @NotNull(message = "Dividend amount is required")
        @Positive(message = "Dividend must be greater than zero")
        @Digits(integer = 13, fraction = 2, message = "Dividend can have up to 13 digits and 2 decimal places")
        BigDecimal amount,

        @NotNull(message = "Payment date is required")
        LocalDate paymentDate
) {
}