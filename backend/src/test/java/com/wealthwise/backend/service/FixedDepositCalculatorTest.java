package com.wealthwise.backend.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class FixedDepositCalculatorTest {

    private static final BigDecimal TEN_PERCENT_TAX = new BigDecimal("10");

    @Test
    void calculatesInterestTaxAndMaturityValue() {
        FixedDepositCalculator.Maturity result = FixedDepositCalculator.calculate(
                money("1000000"), money("10"), LocalDate.of(2026, 1, 15), 12, TEN_PERCENT_TAX
        );

        assertEquals(LocalDate.of(2027, 1, 15), result.maturityDate());
        assertMoney("100000", result.grossInterest());
        assertMoney("10000", result.withholdingTax());
        assertMoney("90000", result.netInterest());
        assertMoney("1090000", result.maturityValue());
    }

    @Test
    void calculatesInterestForPartOfAYear() {
        FixedDepositCalculator.Maturity result = FixedDepositCalculator.calculate(
                money("500000"), money("9.5"), LocalDate.of(2026, 1, 15), 6, TEN_PERCENT_TAX
        );

        assertMoney("23750", result.grossInterest());
        assertMoney("21375", result.netInterest());
        assertMoney("521375", result.maturityValue());
    }

    @Test
    void roundsMoneyToTwoDecimalPlaces() {
        FixedDepositCalculator.Maturity result = FixedDepositCalculator.calculate(
                money("333333.33"), money("7.77"), LocalDate.of(2026, 3, 1), 3, TEN_PERCENT_TAX
        );

        assertMoney("6475", result.grossInterest());
        assertMoney("647.50", result.withholdingTax());
        assertMoney("339160.83", result.maturityValue());
    }

    @Test
    void movesToTheLastDayOfAShorterMonth() {
        FixedDepositCalculator.Maturity result = FixedDepositCalculator.calculate(
                money("100000"), money("9"), LocalDate.of(2026, 8, 31), 6, TEN_PERCENT_TAX
        );

        assertEquals(LocalDate.of(2027, 2, 28), result.maturityDate());
    }

    private static void assertMoney(String expected, BigDecimal actual) {
        assertEquals(0, money(expected).compareTo(actual), "Expected " + expected + " but got " + actual);
    }

    private static BigDecimal money(String value) {
        return new BigDecimal(value);
    }
}