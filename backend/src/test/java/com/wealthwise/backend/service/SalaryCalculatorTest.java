package com.wealthwise.backend.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class SalaryCalculatorTest {

    private static final List<SalaryCalculator.Bracket> BRACKETS = List.of(
            bracket("0", "150000", "0", "0"),
            bracket("150000", "233333", "6", "9000"),
            bracket("233333", "275000", "18", "37000"),
            bracket("275000", "316667", "24", "53500"),
            bracket("316667", "358333", "30", "72500"),
            bracket("358333", null, "36", "94000")
    );

    private static final SalaryCalculator.Rates RATES =
            new SalaryCalculator.Rates(money("8"), money("12"), money("3"));

    @Test
    void calculatesApitUsingTheOfficialFormula() {
        assertApit("100000", "0");
        assertApit("150000", "0");
        assertApit("200000", "3000");
        assertApit("233333", "4999.98");
        assertApit("233334", "5000.12");
        assertApit("250000", "8000");
        assertApit("275000", "12500");
        assertApit("300000", "18500");
        assertApit("400000", "50000");
        assertApit("500000", "86000");
    }

    @Test
    void calculatesTakeHomePayWhenEpfAppliesToFullSalary() {
        SalaryCalculator.TakeHome result =
                SalaryCalculator.calculateTakeHome(money("250000"), money("250000"), RATES, BRACKETS);

        assertMoney("20000", result.employeeEpf());
        assertMoney("8000", result.apit());
        assertMoney("28000", result.totalDeductions());
        assertMoney("222000", result.takeHomePay());
        assertMoney("30000", result.employerEpf());
        assertMoney("7500", result.employerEtf());
    }

    @Test
    void usesEpfEarningsForEpfButGrossSalaryForApit() {
        SalaryCalculator.TakeHome result =
                SalaryCalculator.calculateTakeHome(money("250000"), money("200000"), RATES, BRACKETS);

        assertMoney("16000", result.employeeEpf());
        assertMoney("8000", result.apit());
        assertMoney("226000", result.takeHomePay());
    }

    @Test
    void paysDebtBeforeBuildingAnEmergencyFund() {
        List<SalaryCalculator.PlanStep> steps = SalaryCalculator.buildSavingsSteps(
                money("44400"), money("100000"), money("666000"), money("82000")
        );

        assertEquals(3, steps.size());
        assertEquals("PAY_DEBT", steps.get(0).code());
        assertEquals("CURRENT", steps.get(0).status());
        assertEquals(3, steps.get(0).monthsToComplete());
        assertEquals("NEXT", steps.get(1).status());
        assertEquals(14, steps.get(1).monthsToComplete());
    }

    @Test
    void investsOnlyWhenDebtIsClearAndEmergencyFundIsFull() {
        List<SalaryCalculator.PlanStep> steps = SalaryCalculator.buildSavingsSteps(
                money("44400"), money("0"), money("1000"), money("82000")
        );

        assertEquals("DONE", steps.get(0).status());
        assertEquals("INVEST", steps.get(1).code());
        assertEquals("CURRENT", steps.get(1).status());
        assertMoney("44400", steps.get(1).monthlyAmount());
    }

    @Test
    void doesNotInventATimelineWhenThereIsNoMonthlySavings() {
        List<SalaryCalculator.PlanStep> steps = SalaryCalculator.buildSavingsSteps(
                money("0"), money("5000"), money("1000"), money("0")
        );

        assertNull(steps.get(0).monthsToComplete());
    }

    private static void assertApit(String gross, String expected) {
        assertMoney(expected, SalaryCalculator.calculateApit(money(gross), BRACKETS));
    }

    // compareTo ignores decimal places, so 8000 and 8000.00 count as equal.
    private static void assertMoney(String expected, BigDecimal actual) {
        assertEquals(0, money(expected).compareTo(actual), "Expected " + expected + " but got " + actual);
    }

    private static SalaryCalculator.Bracket bracket(String lower, String upper, String rate, String deduction) {
        return new SalaryCalculator.Bracket(
                money(lower),
                upper == null ? null : money(upper),
                money(rate),
                money(deduction)
        );
    }

    private static BigDecimal money(String value) {
        return new BigDecimal(value);
    }
}