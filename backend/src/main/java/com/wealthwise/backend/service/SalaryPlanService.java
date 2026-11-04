package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.MonthlySummaryResponse;
import com.wealthwise.backend.dto.SalaryPlanResponse;
import com.wealthwise.backend.dto.SalaryProfileRequest;
import com.wealthwise.backend.entity.PayrollRuleSet;
import com.wealthwise.backend.entity.SalaryProfile;
import com.wealthwise.backend.exception.ResourceNotFoundException;
import com.wealthwise.backend.repository.PayrollRuleSetRepository;
import com.wealthwise.backend.repository.SalaryProfileRepository;
import com.wealthwise.backend.repository.TaxBracketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaryPlanService {

    private final SalaryProfileRepository salaryProfileRepository;
    private final PayrollRuleSetRepository payrollRuleSetRepository;
    private final TaxBracketRepository taxBracketRepository;
    private final TransactionService transactionService;

    @Transactional
    public SalaryPlanResponse saveProfile(SalaryProfileRequest request, Long userId) {
        SalaryProfile profile = salaryProfileRepository.findByUserId(userId).orElseGet(SalaryProfile::new);

        profile.setUserId(userId);
        profile.setGrossSalary(request.grossSalary());
        profile.setEpfEarnings(request.epfEarnings() != null ? request.epfEarnings() : request.grossSalary());
        profile.setNeedsPercent(request.needsPercent());
        profile.setWantsPercent(request.wantsPercent());
        profile.setSavingsPercent(request.savingsPercent());
        profile.setEmergencyFundMonths(request.emergencyFundMonths());
        profile.setHighInterestDebt(request.highInterestDebt());
        salaryProfileRepository.save(profile);

        return getPlan(userId, YearMonth.now());
    }

    @Transactional(readOnly = true)
    public SalaryPlanResponse getPlan(Long userId, YearMonth month) {
        SalaryProfile profile = salaryProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Salary profile not found"));

        PayrollRuleSet rules = payrollRuleSetRepository
                .findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDesc(month.atEndOfMonth())
                .orElseThrow(() -> new ResourceNotFoundException("No payroll rules found for this month"));

        List<SalaryCalculator.Bracket> brackets = taxBracketRepository
                .findByRuleSetIdOrderByLowerBoundAsc(rules.getId())
                .stream()
                .map(bracket -> new SalaryCalculator.Bracket(
                        bracket.getLowerBound(),
                        bracket.getUpperBound(),
                        bracket.getRate(),
                        bracket.getDeduction()
                ))
                .toList();

        SalaryCalculator.TakeHome takeHome = SalaryCalculator.calculateTakeHome(
                profile.getGrossSalary(),
                profile.getEpfEarnings(),
                new SalaryCalculator.Rates(rules.getEmployeeEpfRate(), rules.getEmployerEpfRate(), rules.getEtfRate()),
                brackets
        );

        BigDecimal takeHomePay = takeHome.takeHomePay();
        BigDecimal needsPlanned = SalaryCalculator.percentOf(takeHomePay, BigDecimal.valueOf(profile.getNeedsPercent()));
        BigDecimal wantsPlanned = SalaryCalculator.percentOf(takeHomePay, BigDecimal.valueOf(profile.getWantsPercent()));
        // Savings gets the remainder, so rounding can't lose a cent.
        BigDecimal savingsPlanned = takeHomePay.subtract(needsPlanned).subtract(wantsPlanned);

        MonthlySummaryResponse summary = transactionService.getMonthlySummary(userId, month);

        List<SalaryPlanResponse.BudgetLine> budget = List.of(
                spendingLine("Needs", profile.getNeedsPercent(), needsPlanned, summary.needs()),
                spendingLine("Wants", profile.getWantsPercent(), wantsPlanned, summary.wants()),
                savingsLine(profile.getSavingsPercent(), savingsPlanned, summary.netSavings())
        );

        BigDecimal emergencyFundTarget = needsPlanned.multiply(BigDecimal.valueOf(profile.getEmergencyFundMonths()));
        BigDecimal cashBalance = transactionService.calculateNetSavings(userId);

        List<SalaryCalculator.PlanStep> steps = SalaryCalculator.buildSavingsSteps(
                savingsPlanned,
                profile.getHighInterestDebt(),
                emergencyFundTarget,
                cashBalance
        );

        return new SalaryPlanResponse(
                month.toString(),
                new SalaryPlanResponse.Profile(
                        profile.getGrossSalary(),
                        profile.getEpfEarnings(),
                        profile.getNeedsPercent(),
                        profile.getWantsPercent(),
                        profile.getSavingsPercent(),
                        profile.getEmergencyFundMonths(),
                        profile.getHighInterestDebt()
                ),
                takeHome,
                budget,
                steps,
                emergencyFundTarget,
                cashBalance,
                rules.getEffectiveFrom(),
                rules.getSourceNote()
        );
    }

    private SalaryPlanResponse.BudgetLine spendingLine(String name, Integer percent, BigDecimal planned, BigDecimal actual) {
        String status = actual.compareTo(planned) <= 0 ? "ON_TRACK" : "OVER";
        return new SalaryPlanResponse.BudgetLine(name, percent, planned, actual, planned.subtract(actual), status);
    }

    private SalaryPlanResponse.BudgetLine savingsLine(Integer percent, BigDecimal planned, BigDecimal actual) {
        String status = actual.compareTo(planned) >= 0 ? "ON_TRACK" : "BEHIND";
        return new SalaryPlanResponse.BudgetLine("Savings", percent, planned, actual, planned.subtract(actual), status);
    }
}