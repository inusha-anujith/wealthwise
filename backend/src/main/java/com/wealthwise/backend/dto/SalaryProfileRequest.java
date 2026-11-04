package com.wealthwise.backend.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record SalaryProfileRequest(
        @NotNull(message = "Gross salary is required")
        @Positive(message = "Gross salary must be greater than zero")
        @Digits(integer = 13, fraction = 2, message = "Gross salary can have up to 13 digits and 2 decimal places")
        BigDecimal grossSalary,

        // Optional. If empty, EPF is calculated on the full gross salary.
        @PositiveOrZero(message = "EPF earnings cannot be negative")
        @Digits(integer = 13, fraction = 2, message = "EPF earnings can have up to 13 digits and 2 decimal places")
        BigDecimal epfEarnings,

        @NotNull(message = "Needs percentage is required")
        @Min(value = 0, message = "Needs percentage cannot be negative")
        @Max(value = 100, message = "Needs percentage cannot be more than 100")
        Integer needsPercent,

        @NotNull(message = "Wants percentage is required")
        @Min(value = 0, message = "Wants percentage cannot be negative")
        @Max(value = 100, message = "Wants percentage cannot be more than 100")
        Integer wantsPercent,

        @NotNull(message = "Savings percentage is required")
        @Min(value = 0, message = "Savings percentage cannot be negative")
        @Max(value = 100, message = "Savings percentage cannot be more than 100")
        Integer savingsPercent,

        @NotNull(message = "Emergency fund months are required")
        @Min(value = 0, message = "Emergency fund months cannot be negative")
        @Max(value = 24, message = "Emergency fund months cannot be more than 24")
        Integer emergencyFundMonths,

        @NotNull(message = "High-interest debt is required (use 0 if you have none)")
        @PositiveOrZero(message = "High-interest debt cannot be negative")
        @Digits(integer = 13, fraction = 2, message = "Debt can have up to 13 digits and 2 decimal places")
        BigDecimal highInterestDebt
) {
    @AssertTrue(message = "Needs, wants and savings must add up to 100%")
    public boolean isBudgetSplitValid() {
        if (needsPercent == null || wantsPercent == null || savingsPercent == null) {
            return true;
        }
        return needsPercent + wantsPercent + savingsPercent == 100;
    }

    @AssertTrue(message = "EPF earnings cannot be more than gross salary")
    public boolean isEpfEarningsValid() {
        return epfEarnings == null || grossSalary == null || epfEarnings.compareTo(grossSalary) <= 0;
    }
}