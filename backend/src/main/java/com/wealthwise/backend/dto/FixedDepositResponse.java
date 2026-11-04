package com.wealthwise.backend.dto;

import com.wealthwise.backend.entity.FixedDeposit;
import com.wealthwise.backend.entity.FixedDepositStatus;
import com.wealthwise.backend.service.FixedDepositCalculator;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FixedDepositResponse(
        Long id,
        String bankName,
        BigDecimal principalAmount,
        BigDecimal interestRate,
        LocalDate startDate,
        Integer durationMonths,
        FixedDepositStatus status,
        LocalDate maturedOn,
        LocalDate maturityDate,
        BigDecimal grossInterest,
        BigDecimal withholdingTax,
        BigDecimal netInterest,
        BigDecimal maturityValue,
        boolean canMature
) {
    public static FixedDepositResponse from(
            FixedDeposit deposit,
            FixedDepositCalculator.Maturity maturity,
            LocalDate today
    ) {
        boolean canMature = deposit.getStatus() == FixedDepositStatus.ACTIVE
                && !maturity.maturityDate().isAfter(today);

        return new FixedDepositResponse(
                deposit.getId(),
                deposit.getBankName(),
                deposit.getPrincipalAmount(),
                deposit.getInterestRate(),
                deposit.getStartDate(),
                deposit.getDurationMonths(),
                deposit.getStatus(),
                deposit.getMaturedOn(),
                maturity.maturityDate(),
                maturity.grossInterest(),
                maturity.withholdingTax(),
                maturity.netInterest(),
                maturity.maturityValue(),
                canMature
        );
    }
}