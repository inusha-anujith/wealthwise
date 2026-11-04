package com.wealthwise.backend.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TransactionCategory {
    SALARY("Salary", BudgetGroup.INCOME, true),
    SIDE_INCOME("Side Income / Freelancing", BudgetGroup.INCOME, true),
    RENTAL_INCOME("Rental Income", BudgetGroup.INCOME, true),
    FD_INTEREST("Fixed Deposit Interest", BudgetGroup.INCOME, true),
    OTHER_INCOME("Other Income", BudgetGroup.INCOME, true),
    DIVIDEND_INCOME("Dividend Income", BudgetGroup.INCOME, false),

    HOUSEHOLD("Groceries & Household", BudgetGroup.NEEDS, true),
    HOUSING("Rent & Housing", BudgetGroup.NEEDS, true),
    LOANS("Loans & Debt", BudgetGroup.NEEDS, true),
    INSURANCE("Insurance", BudgetGroup.NEEDS, true),
    UTILITIES("Utilities & Bills", BudgetGroup.NEEDS, true),
    TRANSPORT("Transport", BudgetGroup.NEEDS, true),
    HEALTH("Health & Medical", BudgetGroup.NEEDS, true),
    EDUCATION_FEES("Education & Annual Fees", BudgetGroup.NEEDS, true),

    DINING_ENTERTAINMENT("Dining & Entertainment", BudgetGroup.WANTS, true),
    SHOPPING("Shopping & Personal", BudgetGroup.WANTS, true),
    OTHER_EXPENSE("Other Expenses", BudgetGroup.WANTS, true),

    STOCK_PURCHASE("Stock Purchase", BudgetGroup.INVESTMENTS, false),
    FIXED_DEPOSIT("Fixed Deposit", BudgetGroup.INVESTMENTS, false),

    FIXED_DEPOSIT_RETURN("Fixed Deposit Returned", BudgetGroup.INVESTMENT_RETURNS, false);
    private final String label;
    private final BudgetGroup group;
    private final boolean manual;

    public TransactionType getType() {
    boolean moneyIn = group == BudgetGroup.INCOME || group == BudgetGroup.INVESTMENT_RETURNS;
    return moneyIn ? TransactionType.INCOME : TransactionType.EXPENSE;
    }
}