package com.wealthwise.backend.controller;

import com.wealthwise.backend.dto.FinancialAdvice;
import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/*
 * THEORY: REST Controller & Architecture Layering
 * ------------------------------------------------
 * @CrossOrigin: Configures Cross-Origin Resource Sharing (CORS) headers, permitting 
 * requests originating from the Next.js client domain (http://localhost:3000).
 * 
 * @RestController: Specialization of @Controller that combines @Controller and @ResponseBody.
 * It instructs Spring MVC that handler method return values should be bound directly 
 * to the web response body as serialized JSON via Jackson.
 * 
 * @RequestMapping: Defines the base URI routing path ("/api/transactions") for all 
 * handler methods declared within this controller.
 * 
 * @RequiredArgsConstructor: A Lombok annotation generating a constructor for all 
 * 'final' fields, facilitating constructor-based Dependency Injection (DI) without 
 * requiring the explicit @Autowired annotation.
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    // Immutable service dependency adhering to inversion of control (IoC).
    private final TransactionService transactionService;

    /*
     * THEORY: Cryptographic Identity Enforcement & Foreign Key Population
     * --------------------------------------------------------------------
     * Problem Solved: PostgreSQL throws "null value in column 'user_id' violates not-null constraint"
     * when saving raw JSON because the payload contains a detached ID or missing relation, not a managed User.
     * 
     * @AuthenticationPrincipal: Resolves the currently authenticated principal directly 
     * from Spring Security's SecurityContextHolder. Because JwtAuthenticationFilter already 
     * verified the JWT signature and set the Authentication token, we can safely inject the User.
     * 
     * Security Best Practice: Never trust client-supplied user IDs in request bodies. Binding 
     * transaction.setUser(currentUser) server-side guarantees data isolation and prevents 
     * Insecure Direct Object References (IDOR).
     */
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(
            @Valid @RequestBody Transaction transaction,
            @AuthenticationPrincipal User currentUser
    ) {
        // Explicitly attach the authenticated JPA entity before persistence to populate 'user_id'
        transaction.setUser(currentUser);
        Transaction savedTransaction = transactionService.recordTransaction(transaction);
        return ResponseEntity.ok(savedTransaction);
    }

    /*
     * THEORY: Calculated Aggregations & Precise Financial Types
     * ---------------------------------------------------------
     * @GetMapping: Maps HTTP GET requests to read resources without modifying state.
     * @PathVariable: Extracts dynamic values directly from URI path segments (e.g., /net-savings/1).
     * 
     * BigDecimal Usage: Floating-point types (float/double) suffer from binary rounding errors.
     * Financial domain logic strictly uses BigDecimal for exact, arbitrary-precision arithmetic.
     */
    @GetMapping("/net-savings/{userId}")
    public ResponseEntity<BigDecimal> getNetSavings(@PathVariable Long userId) {
        BigDecimal netSavings = transactionService.calculateNetSavings(userId);
        return ResponseEntity.ok(netSavings);
    }

    /*
     * THEORY: Resource Collection Endpoints
     * --------------------------------------
     * Returns a JSON array representation of transactions filtered by foreign key (userId).
     * ResponseEntity<T>: Represents the entire HTTP response (status code, headers, and body).
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getUserTransactions(@PathVariable Long userId) {
        List<Transaction> transactions = transactionService.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }

    /*
     * THEORY: Idempotent Deletion & Standard HTTP Status Codes
     * --------------------------------------------------------
     * @DeleteMapping: Maps HTTP DELETE requests for resource removal.
     * ResponseEntity.noContent(): Emits HTTP 204 (No Content), which is the RESTful convention
     * indicating successful execution where no entity body needs to be returned to the client.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    /*
     * THEORY: Advisory Domain Separation via DTOs (Data Transfer Objects)
     * -------------------------------------------------------------------
     * Separates transactional CRUD endpoints from business analytics calculations.
     * FinancialAdvice is a structured DTO that aggregates rules-engine diagnostics 
     * (e.g., burn rate, savings ratios, alert thresholds) without altering persistent entities.
     */
    @GetMapping("/user/{userId}/advice")
    public ResponseEntity<FinancialAdvice> getCashFlowAdvice(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.analyzeCashFlow(userId));
    }
}