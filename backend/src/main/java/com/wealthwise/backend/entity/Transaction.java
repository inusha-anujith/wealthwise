package com.wealthwise.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * RELATIONAL MAPPING: @ManyToOne
     * OOP Concept: Composition (A Transaction "has a" User).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * ENUM MAPPING: @Enumerated(EnumType.STRING)
     * Saves the enum as readable text ("INCOME" or "EXPENSE") in the database 
     * rather than an integer (0 or 1), making the database easier to read.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Transaction type cannot be null")
    private TransactionType type;

    /**
     * FINANCIAL PRECISION: BigDecimal
     * @Positive (Validation): Enforces the "Fail-Fast" principle. It blocks 
     * negative numbers before they even reach the database.
     */
    @Column(nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;

    // e.g., "Groceries", "Salary", "Vehicle Maintenance"
    @Column(nullable = false)
    private String category;

    // The actual date the transaction occurred (not necessarily the day it was typed in)
    @Column(nullable = false)
    private LocalDate transactionDate;

    // Optional field for extra details, so nullable = true is implied
    @Column(length = 500)
    private String description;
}