package com.wealthwise.backend.dto;

import com.wealthwise.backend.entity.Asset;

import java.math.BigDecimal;

public record AssetResponse(
        Long id,
        String tickerSymbol,
        Integer sharesOwned,
        BigDecimal averagePurchasePrice
) {
    public static AssetResponse from(Asset asset) {
        return new AssetResponse(
                asset.getId(),
                asset.getTickerSymbol(),
                asset.getSharesOwned(),
                asset.getAveragePurchasePrice()
        );
    }
}