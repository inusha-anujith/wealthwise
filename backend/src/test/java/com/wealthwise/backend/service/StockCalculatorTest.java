package com.wealthwise.backend.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StockCalculatorTest {

    @Test
    void calculatesProfitAtTheCurrentPrice() {
        StockCalculator.Position result = StockCalculator.calculatePosition(100, money("20"), money("25"));

        assertMoney("2000", result.costValue());
        assertMoney("2500", result.marketValue());
        assertMoney("500", result.unrealizedGain());
        assertMoney("25", result.unrealizedGainPercent());
    }

    @Test
    void usesCostWhenThereIsNoCurrentPrice() {
        StockCalculator.Position result = StockCalculator.calculatePosition(100, money("20"), null);

        assertMoney("2000", result.marketValue());
        assertMoney("0", result.unrealizedGain());
    }

    @Test
    void handlesAFullySoldPosition() {
        StockCalculator.Position result = StockCalculator.calculatePosition(0, money("20"), money("25"));

        assertMoney("0", result.marketValue());
        assertMoney("0", result.unrealizedGainPercent());
    }

    @Test
    void calculatesProfitAndLossOnASale() {
        StockCalculator.Sale profit = StockCalculator.calculateSale(40, money("20"), money("30"));
        StockCalculator.Sale loss = StockCalculator.calculateSale(60, money("20"), money("10"));

        assertMoney("1200", profit.proceeds());
        assertMoney("800", profit.costBasis());
        assertMoney("400", profit.realizedGain());
        assertMoney("-600", loss.realizedGain());
    }

    private static void assertMoney(String expected, BigDecimal actual) {
        assertEquals(0, money(expected).compareTo(actual), "Expected " + expected + " but got " + actual);
    }

    private static BigDecimal money(String value) {
        return new BigDecimal(value);
    }
}