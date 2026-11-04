package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.CategoryResponse;
import com.wealthwise.backend.dto.CategoryTotalResponse;
import com.wealthwise.backend.dto.FinancialAdvice;
import com.wealthwise.backend.dto.MonthlySummaryResponse;
import com.wealthwise.backend.dto.TransactionRequest;
import com.wealthwise.backend.dto.TransactionResponse;
import com.wealthwise.backend.entity.BudgetGroup;
import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionCategory;
import com.wealthwise.backend.entity.TransactionSource;
import com.wealthwise.backend.entity.TransactionType;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.exception.ConflictException;
import com.wealthwise.backend.exception.ResourceNotFoundException;
import com.wealthwise.backend.repository.CategoryTotal;
import com.wealthwise.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public List<CategoryResponse> getManualCategories() {
        return Arrays.stream(TransactionCategory.values())
                .filter(TransactionCategory::isManual)
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public TransactionResponse recordTransaction(TransactionRequest request, User currentUser) {
        Transaction transaction = new Transaction();
        transaction.setUser(currentUser);
        applyRequest(transaction, request);

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request, Long userId) {
        Transaction transaction = findManualTransaction(id, userId);
        applyRequest(transaction, request);

        // The entity is managed by this transaction, so Hibernate saves the change on commit.
        return TransactionResponse.from(transaction);
    }

    @Transactional
    public void deleteTransaction(Long id, Long userId) {
        transactionRepository.delete(findManualTransaction(id, userId));
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getUserTransactions(Long userId, YearMonth month) {
        List<Transaction> transactions = month == null
                ? transactionRepository.findByUserIdOrderByTransactionDateDescIdDesc(userId)
                : transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDescIdDesc(
                        userId, month.atDay(1), month.atEndOfMonth()
                );

        return transactions.stream().map(TransactionResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public MonthlySummaryResponse getMonthlySummary(Long userId, YearMonth month) {
        List<CategoryTotal> rows = transactionRepository.sumByCategory(
                userId, month.atDay(1), month.atEndOfMonth()
        );

        BigDecimal totalIncome = sumGroup(rows, BudgetGroup.INCOME);
        BigDecimal needs = sumGroup(rows, BudgetGroup.NEEDS);
        BigDecimal wants = sumGroup(rows, BudgetGroup.WANTS);
        BigDecimal invested = sumGroup(rows, BudgetGroup.INVESTMENTS);

        // Investing moves money into an asset, so it isn't a living expense.
        BigDecimal totalExpenses = needs.add(wants);
        BigDecimal netSavings = totalIncome.subtract(totalExpenses);
        BigDecimal remainingCash = netSavings.subtract(invested);
        BigDecimal investmentReturns = sumGroup(rows, BudgetGroup.INVESTMENT_RETURNS);
        BigDecimal savingsRate = totalIncome.signum() > 0
                ? netSavings.multiply(BigDecimal.valueOf(100)).divide(totalIncome, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<CategoryTotalResponse> categories = rows.stream()
                .map(row -> new CategoryTotalResponse(
                        row.getCategory().name(),
                        row.getCategory().getLabel(),
                        row.getCategory().getGroup(),
                        row.getTotal()
                ))
                .sorted(Comparator.comparing(CategoryTotalResponse::total).reversed())
                .toList();

                return new MonthlySummaryResponse(
                        month.toString(), totalIncome, needs, wants, totalExpenses,
                        invested, investmentReturns, netSavings, remainingCash, savingsRate, categories
);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateNetSavings(Long userId) {
        BigDecimal balance = BigDecimal.ZERO;

        for (Transaction transaction : transactionRepository.findByUserId(userId)) {
            if (transaction.getType() == TransactionType.INCOME) {
                balance = balance.add(transaction.getAmount());
            } else {
                balance = balance.subtract(transaction.getAmount());
            }
        }

        return balance;
    }

    @Transactional(readOnly = true)
    public FinancialAdvice analyzeCashFlow(Long userId) {
        FinancialAdvice advice = new FinancialAdvice();

        if (calculateNetSavings(userId).compareTo(BigDecimal.ZERO) < 0) {
            advice.setStatus("WARNING");
            advice.setMessage("Your expenses are higher than your income. Review your spending.");
        } else {
            advice.setStatus("HEALTHY");
            advice.setMessage("Your cash flow is positive. Consider saving or investing the surplus.");
        }

        return advice;
    }

    private void applyRequest(Transaction transaction, TransactionRequest request) {
        if (!request.category().isManual()) {
            throw new ConflictException("This category is only created automatically.");
        }

        transaction.setCategory(request.category());
        transaction.setType(request.category().getType());
        transaction.setAmount(request.amount());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setDescription(request.description());
    }

    private Transaction findManualTransaction(Long id, Long userId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (transaction.getSourceType() != TransactionSource.MANUAL) {
            throw new ConflictException("This entry was created automatically. Change its stock or fixed deposit instead.");
        }

        return transaction;
    }

    private BigDecimal sumGroup(List<CategoryTotal> rows, BudgetGroup group) {
        return rows.stream()
                .filter(row -> row.getCategory().getGroup() == group)
                .map(CategoryTotal::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}