package com.wealthwise.backend.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SimulatorCalculatorTest {

    @Test
    void idleCashOnlyGrowsByContributions() {
        assertMoney("220000", SimulatorCalculator.projectValue(money("100000"), money("10000"), 1, money("0")));
    }

    @Test
    void growthCompoundsEachMonth() {
        assertMoney("112682.50", SimulatorCalculator.projectValue(money("100000"), money("0"), 1, money("12")));
    }

    @Test
    void contributionsAlsoEarnGrowth() {
        assertMoney("239507.53", SimulatorCalculator.projectValue(money("100000"), money("10000"), 1, money("12")));
    }

    @Test
    void convertsFutureMoneyToTodaysBuyingPower() {
        assertMoney("100000", SimulatorCalculator.toTodaysMoney(money("121000"), 2, money("10")));
    }

    @Test
    void removesTaxFromTheRate() {
        assertMoney("9", SimulatorCalculator.afterTaxRate(money("10"), money("10")));
        assertMoney("8.55", SimulatorCalculator.afterTaxRate(money("9.5"), money("10")));
    }

    // when tax is 0%, the rate should stay the same.

    private static void assertMoney(String expected, BigDecimal actual) {
        assertEquals(0, money(expected).compareTo(actual), "Expected " + expected + " but got " + actual);
    }

    private static BigDecimal money(String value) {
        return new BigDecimal(value);
    }
}