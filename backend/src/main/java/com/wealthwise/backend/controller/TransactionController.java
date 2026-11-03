package com.wealthwise.backend.controller;

import com.wealthwise.backend.dto.CategoryResponse;
import com.wealthwise.backend.dto.FinancialAdvice;
import com.wealthwise.backend.dto.MonthlySummaryResponse;
import com.wealthwise.backend.dto.TransactionRequest;
import com.wealthwise.backend.dto.TransactionResponse;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(transactionService.getManualCategories());
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.recordTransaction(request, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, request, currentUser.getId()));
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getMyTransactions(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth month,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(transactionService.getUserTransactions(currentUser.getId(), month));
    }

    @GetMapping("/summary")
    public ResponseEntity<MonthlySummaryResponse> getMonthlySummary(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(transactionService.getMonthlySummary(currentUser.getId(), month));
    }

    @GetMapping("/net-savings")
    public ResponseEntity<BigDecimal> getMyNetSavings(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(transactionService.calculateNetSavings(currentUser.getId()));
    }

    @GetMapping("/advice")
    public ResponseEntity<FinancialAdvice> getMyAdvice(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(transactionService.analyzeCashFlow(currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        transactionService.deleteTransaction(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}