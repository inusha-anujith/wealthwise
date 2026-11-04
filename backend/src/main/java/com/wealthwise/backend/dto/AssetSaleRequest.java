package com.wealthwise.backend.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssetSaleRequest(
        @NotNull(message = "Number of shares is required")
        @Positive(message = "Shares sold must be greater than zero")
        Integer sharesSold,

        @NotNull(message = "Sale price is required")
        @Positive(message = "Sale price must be greater than zero")
        @Digits(integer = 13, fraction = 2, message = "Price can have up to 13 digits and 2 decimal places")
        BigDecimal salePrice,

        @NotNull(message = "Sale date is required")
        @PastOrPresent(message = "Sale date cannot be in the future")
        LocalDate saleDate
) {
}