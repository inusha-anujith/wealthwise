package com.wealthwise.backend.dto;

import com.wealthwise.backend.service.SalaryCalculator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SalaryPlanResponse(
        String month,
        Profile profile,
        SalaryCalculator.TakeHome takeHome,
        List<BudgetLine> budget,
        List<SalaryCalculator.PlanStep> steps,
        BigDecimal emergencyFundTarget,
        BigDecimal cashBalance,
        LocalDate rulesEffectiveFrom,
        String rulesSource
) {
    public record Profile(
            BigDecimal grossSalary,
            BigDecimal epfEarnings,
            Integer needsPercent,
            Integer wantsPercent,
            Integer savingsPercent,
            Integer emergencyFundMonths,
            BigDecimal highInterestDebt
    ) {
    }

    public record BudgetLine(
            String name,
            Integer percent,
            BigDecimal planned,
            BigDecimal actual,
            BigDecimal remaining,
            String status
    ) {
    }
}