package com.wealthwise.backend.dto;

import com.wealthwise.backend.entity.Asset;
import com.wealthwise.backend.service.StockCalculator;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AssetResponse(
        Long id,
        String tickerSymbol,
        Integer sharesOwned,
        BigDecimal averagePurchasePrice,
        BigDecimal currentPrice,
        LocalDate priceUpdatedOn,
        BigDecimal costValue,
        BigDecimal marketValue,
        BigDecimal unrealizedGain,
        BigDecimal unrealizedGainPercent,
        BigDecimal realizedGain,
        BigDecimal dividendsReceived
) {
    public static AssetResponse from(
            Asset asset,
            StockCalculator.Position position,
            BigDecimal realizedGain,
            BigDecimal dividendsReceived
    ) {
        return new AssetResponse(
                asset.getId(),
                asset.getTickerSymbol(),
                asset.getSharesOwned(),
                asset.getAveragePurchasePrice(),
                asset.getCurrentPrice(),
                asset.getPriceUpdatedOn(),
                position.costValue(),
                position.marketValue(),
                position.unrealizedGain(),
                position.unrealizedGainPercent(),
                realizedGain,
                dividendsReceived
        );
    }
}