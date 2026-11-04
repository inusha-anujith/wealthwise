package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.FixedDepositRequest;
import com.wealthwise.backend.dto.FixedDepositResponse;
import com.wealthwise.backend.entity.FixedDeposit;
import com.wealthwise.backend.entity.FixedDepositStatus;
import com.wealthwise.backend.entity.InvestmentTaxRule;
import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionCategory;
import com.wealthwise.backend.entity.TransactionSource;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.exception.ConflictException;
import com.wealthwise.backend.exception.ResourceNotFoundException;
import com.wealthwise.backend.repository.FixedDepositRepository;
import com.wealthwise.backend.repository.InvestmentTaxRuleRepository;
import com.wealthwise.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FixedDepositService {

    private final FixedDepositRepository fixedDepositRepository;
    private final TransactionRepository transactionRepository;
    private final InvestmentTaxRuleRepository investmentTaxRuleRepository;

    @Transactional
    public FixedDepositResponse recordFixedDeposit(FixedDepositRequest request, User currentUser) {
        FixedDeposit deposit = new FixedDeposit();
        deposit.setUser(currentUser);
        deposit.setBankName(request.bankName());
        deposit.setPrincipalAmount(request.principalAmount());
        deposit.setInterestRate(request.interestRate());
        deposit.setStartDate(request.startDate());
        deposit.setDurationMonths(request.durationMonths());
        FixedDeposit savedDeposit = fixedDepositRepository.save(deposit);

        if (request.deductFromCash()) {
            addLedgerEntry(
                    currentUser,
                    TransactionCategory.FIXED_DEPOSIT,
                    request.principalAmount(),
                    request.startDate(),
                    savedDeposit
            );
        }

        return toResponse(savedDeposit);
    }

    @Transactional(readOnly = true)
    public List<FixedDepositResponse> getUserFixedDeposits(Long userId) {
        return fixedDepositRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Returns the principal and after-tax interest to cash as one all-or-nothing change.
    @Transactional
    public FixedDepositResponse matureFixedDeposit(Long id, User currentUser) {
        FixedDeposit deposit = findOwnedDeposit(id, currentUser.getId());

        if (deposit.getStatus() == FixedDepositStatus.MATURED) {
            throw new ConflictException("This fixed deposit has already matured.");
        }

        FixedDepositCalculator.Maturity maturity = calculateMaturity(deposit);

        if (maturity.maturityDate().isAfter(LocalDate.now())) {
            throw new ConflictException("This fixed deposit hasn't reached its maturity date.");
        }

        addLedgerEntry(
                currentUser,
                TransactionCategory.FIXED_DEPOSIT_RETURN,
                deposit.getPrincipalAmount(),
                maturity.maturityDate(),
                deposit
        );

        if (maturity.netInterest().signum() > 0) {
            addLedgerEntry(
                    currentUser,
                    TransactionCategory.FD_INTEREST,
                    maturity.netInterest(),
                    maturity.maturityDate(),
                    deposit
            );
        }

        deposit.setStatus(FixedDepositStatus.MATURED);
        deposit.setMaturedOn(maturity.maturityDate());

        return toResponse(deposit);
    }

    @Transactional
    public void deleteFixedDeposit(Long id, Long userId) {
        FixedDeposit deposit = findOwnedDeposit(id, userId);

        transactionRepository.deleteBySourceTypeAndSourceId(TransactionSource.FIXED_DEPOSIT, deposit.getId());
        fixedDepositRepository.delete(deposit);
    }

    private FixedDeposit findOwnedDeposit(Long id, Long userId) {
        return fixedDepositRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Fixed deposit not found"));
    }

    private FixedDepositResponse toResponse(FixedDeposit deposit) {
        return FixedDepositResponse.from(deposit, calculateMaturity(deposit), LocalDate.now());
    }

    private FixedDepositCalculator.Maturity calculateMaturity(FixedDeposit deposit) {
        LocalDate maturityDate = deposit.getStartDate().plusMonths(deposit.getDurationMonths());

        return FixedDepositCalculator.calculate(
                deposit.getPrincipalAmount(),
                deposit.getInterestRate(),
                deposit.getStartDate(),
                deposit.getDurationMonths(),
                withholdingRateOn(maturityDate)
        );
    }

    // Uses the rule active on that date, or the oldest rule for earlier dates.
    private BigDecimal withholdingRateOn(LocalDate date) {
        return investmentTaxRuleRepository
                .findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDesc(date)
                .or(investmentTaxRuleRepository::findFirstByOrderByEffectiveFromAsc)
                .map(InvestmentTaxRule::getFdInterestWhtRate)
                .orElseThrow(() -> new ResourceNotFoundException("No investment tax rules found"));
    }

    private void addLedgerEntry(
            User user,
            TransactionCategory category,
            BigDecimal amount,
            LocalDate date,
            FixedDeposit deposit
    ) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setType(category.getType());
        transaction.setAmount(amount);
        transaction.setTransactionDate(date);
        transaction.setDescription(deposit.getBankName());
        transaction.setSourceType(TransactionSource.FIXED_DEPOSIT);
        transaction.setSourceId(deposit.getId());
        transactionRepository.save(transaction);
    }
}