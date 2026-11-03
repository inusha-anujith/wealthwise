package com.wealthwise.backend.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AssetRequest(
        @NotBlank(message = "Ticker symbol is required")
        @Size(max = 20, message = "Ticker symbol must be 20 characters or fewer")
        String tickerSymbol,

        @NotNull(message = "Number of shares is required")
        @Positive(message = "Shares must be greater than zero")
        Integer sharesOwned,

        @NotNull(message = "Purchase price is required")
        @Positive(message = "Purchase price must be greater than zero")
        @Digits(integer = 13, fraction = 2, message = "Price can have up to 13 digits and 2 decimal places")
        BigDecimal averagePurchasePrice,

        @NotNull(message = "Choose whether to deduct this purchase from cash")
        Boolean deductFromCash
) {
}