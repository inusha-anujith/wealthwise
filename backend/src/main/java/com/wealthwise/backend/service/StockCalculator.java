package com.wealthwise.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

// Pure calculation code for stock positions and sales.
public final class StockCalculator {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private StockCalculator() {
    }

    public record Position(
            BigDecimal costValue,
            BigDecimal marketValue,
            BigDecimal unrealizedGain,
            BigDecimal unrealizedGainPercent
    ) {
    }

    public record Sale(BigDecimal proceeds, BigDecimal costBasis, BigDecimal realizedGain) {
    }

    // Without a current price, the position is valued at what it cost.
    public static Position calculatePosition(int shares, BigDecimal averagePrice, BigDecimal currentPrice) {
        BigDecimal costValue = multiply(shares, averagePrice);
        BigDecimal marketValue = currentPrice == null ? costValue : multiply(shares, currentPrice);
        BigDecimal gain = marketValue.subtract(costValue);
        BigDecimal gainPercent = costValue.signum() > 0
                ? gain.multiply(HUNDRED).divide(costValue, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2);

        return new Position(costValue, marketValue, gain, gainPercent);
    }

    public static Sale calculateSale(int sharesSold, BigDecimal averagePrice, BigDecimal salePrice) {
        BigDecimal proceeds = multiply(sharesSold, salePrice);
        BigDecimal costBasis = multiply(sharesSold, averagePrice);

        return new Sale(proceeds, costBasis, proceeds.subtract(costBasis));
    }

    private static BigDecimal multiply(int shares, BigDecimal price) {
        return price.multiply(BigDecimal.valueOf(shares)).setScale(2, RoundingMode.HALF_UP);
    }
}