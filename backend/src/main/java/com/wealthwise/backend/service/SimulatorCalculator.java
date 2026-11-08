package com.wealthwise.backend.service;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

// Pure growth calculations. The rates are user assumptions, not predictions.
public final class SimulatorCalculator {

    private static final BigDecimal MONTHS_TIMES_PERCENT = BigDecimal.valueOf(1200);
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final int WORKING_SCALE = 10;

    private SimulatorCalculator() {
    }

    // Each month: add that month's growth, then add the monthly contribution.
    public static BigDecimal projectValue(
            BigDecimal startingAmount,
            BigDecimal monthlyContribution,
            int years,
            BigDecimal annualRatePercent
    ) {
        BigDecimal monthlyRate = annualRatePercent.divide(MONTHS_TIMES_PERCENT, WORKING_SCALE, RoundingMode.HALF_UP);
        BigDecimal balance = startingAmount;

        for (int month = 0; month < years * 12; month++) {
            BigDecimal growth = balance.multiply(monthlyRate);
            balance = balance.add(growth).add(monthlyContribution);
        }

        return balance.setScale(2, RoundingMode.HALF_UP);
    }

    // Shows a future amount in today's buying power.
    public static BigDecimal toTodaysMoney(BigDecimal futureValue, int years, BigDecimal inflationPercent) {
        BigDecimal yearlyFactor = BigDecimal.ONE.add(
                inflationPercent.divide(HUNDRED, WORKING_SCALE, RoundingMode.HALF_UP)
        );

        return futureValue.divide(yearlyFactor.pow(years), new MathContext(20)).setScale(2, RoundingMode.HALF_UP);
    }

    // return the rate that remains after tax.
    public static BigDecimal afterTaxRate(BigDecimal annualRatePercent, BigDecimal taxPercent) {

        BigDecimal afterTaxRate = annualRatePercent.multiply(BigDecimal.ONE.subtract(taxPercent.divide(HUNDRED, WORKING_SCALE, RoundingMode.HALF_UP)));
        return afterTaxRate.setScale(2, RoundingMode.HALF_UP);



    }
}