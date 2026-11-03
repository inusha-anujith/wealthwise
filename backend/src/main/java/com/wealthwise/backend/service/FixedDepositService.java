package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.FixedDepositRequest;
import com.wealthwise.backend.dto.FixedDepositResponse;
import com.wealthwise.backend.entity.FixedDeposit;
import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionSource;
import com.wealthwise.backend.entity.TransactionType;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.exception.ResourceNotFoundException;
import com.wealthwise.backend.repository.FixedDepositRepository;
import com.wealthwise.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FixedDepositService {

    private final FixedDepositRepository fixedDepositRepository;
    private final TransactionRepository transactionRepository;

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
            Transaction expense = new Transaction();
            expense.setUser(currentUser);
            expense.setAmount(request.principalAmount());
            expense.setType(TransactionType.EXPENSE);
            expense.setCategory("Fixed Deposit: " + request.bankName());
            expense.setTransactionDate(request.startDate());
            expense.setSourceType(TransactionSource.FIXED_DEPOSIT);
            expense.setSourceId(savedDeposit.getId());
            transactionRepository.save(expense);
        }

        return FixedDepositResponse.from(savedDeposit);
    }

    @Transactional(readOnly = true)
    public List<FixedDepositResponse> getUserFixedDeposits(Long userId) {
        return fixedDepositRepository.findByUserId(userId)
                .stream()
                .map(FixedDepositResponse::from)
                .toList();
    }

    @Transactional
    public void deleteFixedDeposit(Long id, Long userId) {
        FixedDeposit deposit = fixedDepositRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Fixed deposit not found"));

        transactionRepository.deleteBySourceTypeAndSourceId(TransactionSource.FIXED_DEPOSIT, deposit.getId());
        fixedDepositRepository.delete(deposit);
    }
}