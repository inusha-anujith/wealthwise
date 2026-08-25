package com.wealthwise.backend.controller;

import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

// Marks this class as a REST web controller that automatically converts responses to JSON.
@RestController
// Sets the base URL path for all endpoints in this controller to "/api/transactions".
@RequestMapping("/api/transactions")
// Automatically creates a constructor to inject the final TransactionService dependency.
@RequiredArgsConstructor
public class TransactionController {

    // Immutable reference to our business logic service.
    private final TransactionService transactionService;

    // Handles HTTP POST requests to securely receive and save new transaction data.
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@Valid @RequestBody Transaction transaction) {
        Transaction savedTransaction = transactionService.recordTransaction(transaction);
        return ResponseEntity.ok(savedTransaction);
    }

    // Handles HTTP GET requests to retrieve the calculated net savings for a specific user.
    @GetMapping("/net-savings/{userId}")
    public ResponseEntity<BigDecimal> getNetSavings(@PathVariable Long userId) {
        BigDecimal netSavings = transactionService.calculateNetSavings(userId);
        return ResponseEntity.ok(netSavings);
    }
}