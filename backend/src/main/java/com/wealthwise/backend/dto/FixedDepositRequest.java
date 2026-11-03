package com.wealthwise.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FixedDepositRequest(
        @NotBlank(message = "Bank name is required")
        @Size(max = 100, message = "Bank name must be 100 characters or fewer")
        String bankName,

        @NotNull(message = "Principal amount is required")
        @Positive(message = "Principal must be greater than zero")
        @Digits(integer = 13, fraction = 2, message = "Principal can have up to 13 digits and 2 decimal places")
        BigDecimal principalAmount,

        @NotNull(message = "Interest rate is required")
        @Positive(message = "Interest rate must be greater than zero")
        @DecimalMax(value = "100", message = "Interest rate cannot be more than 100%")
        BigDecimal interestRate,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "Duration is required")
        @Positive(message = "Duration must be greater than zero")
        Integer durationMonths
) {
}