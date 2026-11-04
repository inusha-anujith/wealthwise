package com.wealthwise.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

// Pure calculation code: assumes simple interest paid in one amount at maturity.
public final class FixedDepositCalculator {

    private static final BigDecimal MONTHS_TIMES_PERCENT = BigDecimal.valueOf(1200);

    private FixedDepositCalculator() {
    }

    public record Maturity(
            LocalDate maturityDate,
            BigDecimal grossInterest,
            BigDecimal withholdingTax,
            BigDecimal netInterest,
            BigDecimal maturityValue
    ) {
    }

    public static Maturity calculate(
            BigDecimal principal,
            BigDecimal annualRatePercent,
            LocalDate startDate,
            int durationMonths,
            BigDecimal withholdingTaxPercent
    ) {
        BigDecimal grossInterest = principal
                .multiply(annualRatePercent)
                .multiply(BigDecimal.valueOf(durationMonths))
                .divide(MONTHS_TIMES_PERCENT, 2, RoundingMode.HALF_UP);

        BigDecimal withholdingTax = SalaryCalculator.percentOf(grossInterest, withholdingTaxPercent);
        BigDecimal netInterest = grossInterest.subtract(withholdingTax);

        return new Maturity(
                startDate.plusMonths(durationMonths),
                grossInterest,
                withholdingTax,
                netInterest,
                principal.add(netInterest).setScale(2, RoundingMode.HALF_UP)
        );
    }
}