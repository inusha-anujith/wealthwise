package com.wealthwise.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

// Pure money calculations with no database or Spring code, so they are easy to unit test.
public final class SalaryCalculator {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private SalaryCalculator() {
    }

    public record Bracket(BigDecimal lowerBound, BigDecimal upperBound, BigDecimal ratePercent, BigDecimal deduction) {
    }

    public record Rates(BigDecimal employeeEpfPercent, BigDecimal employerEpfPercent, BigDecimal etfPercent) {
    }

    public record TakeHome(
            BigDecimal grossSalary,
            BigDecimal employeeEpf,
            BigDecimal apit,
            BigDecimal totalDeductions,
            BigDecimal takeHomePay,
            BigDecimal employerEpf,
            BigDecimal employerEtf
    ) {
    }

    public record PlanStep(
            String code,
            String title,
            String status,
            String message,
            BigDecimal monthlyAmount,
            BigDecimal remainingAmount,
            Integer monthsToComplete
    ) {
    }

    public static BigDecimal percentOf(BigDecimal amount, BigDecimal percent) {
        return amount.multiply(percent).divide(HUNDRED, 2, RoundingMode.HALF_UP);
    }

    // Inland Revenue formula: (monthly profits x rate) - the bracket's deduction.
    public static BigDecimal calculateApit(BigDecimal grossSalary, List<Bracket> brackets) {
        for (Bracket bracket : brackets) {
            boolean aboveLower = grossSalary.compareTo(bracket.lowerBound()) > 0;
            boolean withinUpper = bracket.upperBound() == null || grossSalary.compareTo(bracket.upperBound()) <= 0;

            if (aboveLower && withinUpper) {
                return percentOf(grossSalary, bracket.ratePercent()).subtract(bracket.deduction()).setScale(2);
            }
        }

        return BigDecimal.ZERO.setScale(2);
    }

    public static TakeHome calculateTakeHome(
            BigDecimal grossSalary,
            BigDecimal epfEarnings,
            Rates rates,
            List<Bracket> brackets
    ) {
        BigDecimal employeeEpf = percentOf(epfEarnings, rates.employeeEpfPercent());
        BigDecimal apit = calculateApit(grossSalary, brackets);
        BigDecimal totalDeductions = employeeEpf.add(apit);

        return new TakeHome(
                grossSalary,
                employeeEpf,
                apit,
                totalDeductions,
                grossSalary.subtract(totalDeductions),
                percentOf(epfEarnings, rates.employerEpfPercent()),
                percentOf(epfEarnings, rates.etfPercent())
        );
    }

    // Priority order: expensive debt, then an emergency fund, then long-term investing.
    public static List<PlanStep> buildSavingsSteps(
            BigDecimal monthlySavings,
            BigDecimal highInterestDebt,
            BigDecimal emergencyFundTarget,
            BigDecimal cashBalance
    ) {
        List<PlanStep> steps = new ArrayList<>();
        boolean hasDebt = highInterestDebt.signum() > 0;
        BigDecimal emergencyShortfall = emergencyFundTarget.subtract(cashBalance).max(BigDecimal.ZERO);
        boolean needsEmergencyFund = emergencyShortfall.signum() > 0;

        if (hasDebt) {
            steps.add(new PlanStep(
                    "PAY_DEBT",
                    "Pay off high-interest debt",
                    "CURRENT",
                    "Expensive debt usually costs more than savings earn, so put your savings budget here first. "
                            + "This estimate leaves out interest, so the real payoff may take longer.",
                    monthlySavings,
                    highInterestDebt,
                    monthsToReach(highInterestDebt, monthlySavings)
            ));
        }

        String emergencyStatus = !needsEmergencyFund ? "DONE" : hasDebt ? "NEXT" : "CURRENT";
        steps.add(new PlanStep(
                "EMERGENCY_FUND",
                "Build an emergency fund",
                emergencyStatus,
                needsEmergencyFund
                        ? "Your target is LKR " + money(emergencyFundTarget) + " and your cash balance is LKR "
                                + money(cashBalance) + "."
                        : "Your cash balance covers your LKR " + money(emergencyFundTarget) + " target.",
                "CURRENT".equals(emergencyStatus) ? monthlySavings : BigDecimal.ZERO.setScale(2),
                emergencyShortfall,
                needsEmergencyFund ? monthsToReach(emergencyShortfall, monthlySavings) : Integer.valueOf(0)
        ));

        boolean canInvest = !hasDebt && !needsEmergencyFund;
        steps.add(new PlanStep(
                "INVEST",
                "Invest for long-term growth",
                canInvest ? "CURRENT" : "NEXT",
                canInvest
                        ? "Your safety net is ready, so compare fixed deposits and CSE investments for this money."
                        : "Start this after the earlier steps are complete.",
                canInvest ? monthlySavings : BigDecimal.ZERO.setScale(2),
                BigDecimal.ZERO.setScale(2),
                null
        ));

        return steps;
    }

    private static Integer monthsToReach(BigDecimal amount, BigDecimal monthlySavings) {
        if (monthlySavings.signum() <= 0) {
            return null;
        }

        return amount.divide(monthlySavings, 0, RoundingMode.CEILING).intValueExact();
    }

    private static String money(BigDecimal amount) {
        return String.format(Locale.ENGLISH, "%,.2f", amount);
    }
}