package com.wealthwise.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record SimulatorRequest(
        @NotNull(message = "Starting amount is required")
        @PositiveOrZero(message = "Starting amount cannot be negative")
        @Digits(integer = 13, fraction = 2, message = "Starting amount can have up to 13 digits and 2 decimal places")
        BigDecimal startingAmount,

        @NotNull(message = "Monthly amount is required")
        @PositiveOrZero(message = "Monthly amount cannot be negative")
        @Digits(integer = 13, fraction = 2, message = "Monthly amount can have up to 13 digits and 2 decimal places")
        BigDecimal monthlyContribution,

        @NotNull(message = "Number of years is required")
        @Min(value = 1, message = "Years must be at least 1")
        @Max(value = 40, message = "Years cannot be more than 40")
        Integer years,

        @NotNull(message = "FD rate is required")
        @DecimalMin(value = "0", message = "FD rate cannot be negative")
        @DecimalMax(value = "100", message = "FD rate cannot be more than 100%")
        BigDecimal fdRate,

        // Stocks can lose money, so this can be negative.
        @NotNull(message = "Stock return is required")
        @DecimalMin(value = "-50", message = "Stock return cannot be below -50%")
        @DecimalMax(value = "50", message = "Stock return cannot be more than 50%")
        BigDecimal stockReturn,

        @NotNull(message = "Inflation rate is required")
        @DecimalMin(value = "0", message = "Inflation cannot be negative")
        @DecimalMax(value = "100", message = "Inflation cannot be more than 100%")
        BigDecimal inflationRate
) {
}