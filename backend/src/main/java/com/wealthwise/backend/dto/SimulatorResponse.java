package com.wealthwise.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record SimulatorResponse(
        Integer years,
        BigDecimal totalContributed,
        BigDecimal inflationRate,
        BigDecimal fdTaxRate,
        String taxSource,
        List<Scenario> scenarios
) {
    // One result card: idle cash, fixed deposit or CSE stocks.
    public record Scenario(
            String name,
            BigDecimal yearlyRate,
            BigDecimal futureValue,
            BigDecimal growth,
            BigDecimal todaysMoney
    ) {
    }
}