package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.FinancialAdvice;
import com.wealthwise.backend.dto.TransactionRequest;
import com.wealthwise.backend.dto.TransactionResponse;
import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionType;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.exception.ResourceNotFoundException;
import com.wealthwise.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    @Transactional
    public TransactionResponse recordTransaction(TransactionRequest request, User currentUser) {
        Transaction transaction = new Transaction();
        transaction.setUser(currentUser);
        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setCategory(request.category());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setDescription(request.description());

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getUserTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByTransactionDateDescIdDesc(userId)
                .stream()
                .map(TransactionResponse::from)
                .toList();
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

    @Transactional
    public void deleteTransaction(Long id, Long userId) {
        // Returns the same 404 whether the record is missing or belongs to someone else.
        Transaction transaction = transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        transactionRepository.delete(transaction);
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
}