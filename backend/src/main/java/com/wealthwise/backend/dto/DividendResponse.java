package com.wealthwise.backend.dto;

import com.wealthwise.backend.entity.Dividend;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DividendResponse(
        Long id,
        Long assetId,
        String tickerSymbol,
        BigDecimal amount,
        LocalDate paymentDate
) {
    public static DividendResponse from(Dividend dividend) {
        return new DividendResponse(
                dividend.getId(),
                dividend.getAsset().getId(),
                dividend.getAsset().getTickerSymbol(),
                dividend.getAmount(),
                dividend.getPaymentDate()
        );
    }
}