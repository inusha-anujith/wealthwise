package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.SimulatorRequest;
import com.wealthwise.backend.dto.SimulatorResponse;
import com.wealthwise.backend.entity.InvestmentTaxRule;
import com.wealthwise.backend.exception.ResourceNotFoundException;
import com.wealthwise.backend.repository.InvestmentTaxRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SimulatorService {

    private final InvestmentTaxRuleRepository investmentTaxRuleRepository;

    public SimulatorResponse simulate(SimulatorRequest request) {
        InvestmentTaxRule taxRule = investmentTaxRuleRepository
                .findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDesc(LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("No investment tax rules found"));

        // all the money the user puts in (starting amount + monthly amount for every month)
        BigDecimal totalContributed = request.startingAmount().add(
        request.monthlyContribution().multiply(BigDecimal.valueOf(request.years() * 12L))
);
            

        BigDecimal fdRateAfterTax = SimulatorCalculator.afterTaxRate(
                request.fdRate(), taxRule.getFdInterestWhtRate()
        );

        // Gains on CSE-listed shares are excluded from capital gains tax, so the stock rate isn't reduced.
        List<SimulatorResponse.Scenario> scenarios = List.of(
                scenario("Idle cash", BigDecimal.ZERO, request, totalContributed),
                scenario("Fixed deposit", fdRateAfterTax, request, totalContributed),
                scenario("CSE stocks", request.stockReturn(), request, totalContributed)
        );

        return new SimulatorResponse(
                request.years(),
                totalContributed,
                request.inflationRate(),
                taxRule.getFdInterestWhtRate(),
                taxRule.getSourceNote(),
                scenarios
        );
    }

    private SimulatorResponse.Scenario scenario(
            String name,
            BigDecimal yearlyRate,
            SimulatorRequest request,
            BigDecimal totalContributed
    ) {
        BigDecimal futureValue = SimulatorCalculator.projectValue(
                request.startingAmount(),
                request.monthlyContribution(),
                request.years(),
                yearlyRate
        );

        return new SimulatorResponse.Scenario(
                name,
                yearlyRate,
                futureValue,
                futureValue.subtract(totalContributed),
                SimulatorCalculator.toTodaysMoney(futureValue, request.years(), request.inflationRate())
        );
    }
}