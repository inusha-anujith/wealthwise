package com.wealthwise.backend.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record AssetPriceRequest(
        @NotNull(message = "Current price is required")
        @Positive(message = "Current price must be greater than zero")
        @Digits(integer = 13, fraction = 2, message = "Price can have up to 13 digits and 2 decimal places")
        BigDecimal currentPrice
) {
}