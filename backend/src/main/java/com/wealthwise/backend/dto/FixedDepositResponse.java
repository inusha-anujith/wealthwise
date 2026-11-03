package com.wealthwise.backend.dto;

import com.wealthwise.backend.entity.FixedDeposit;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FixedDepositResponse(
        Long id,
        String bankName,
        BigDecimal principalAmount,
        BigDecimal interestRate,
        LocalDate startDate,
        Integer durationMonths
) {
    public static FixedDepositResponse from(FixedDeposit deposit) {
        return new FixedDepositResponse(
                deposit.getId(),
                deposit.getBankName(),
                deposit.getPrincipalAmount(),
                deposit.getInterestRate(),
                deposit.getStartDate(),
                deposit.getDurationMonths()
        );
    }
}