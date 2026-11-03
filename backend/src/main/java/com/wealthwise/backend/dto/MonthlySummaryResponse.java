package com.wealthwise.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record MonthlySummaryResponse(
        String month,
        BigDecimal totalIncome,
        BigDecimal needs,
        BigDecimal wants,
        BigDecimal totalExpenses,
        BigDecimal invested,
        BigDecimal netSavings,
        BigDecimal remainingCash,
        BigDecimal savingsRate,
        List<CategoryTotalResponse> categories
) {
}