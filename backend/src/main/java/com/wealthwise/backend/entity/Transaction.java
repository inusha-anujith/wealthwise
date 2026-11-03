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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Saved as readable text ("INCOME" or "EXPENSE") rather than a number.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Transaction type cannot be null")
    private TransactionType type;

    @Column(nullable = false, precision = 15, scale = 2)
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionCategory category;

    // The date the transaction happened, which may not be the day it was entered.
    @Column(nullable = false)
    private LocalDate transactionDate;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private TransactionSource sourceType = TransactionSource.MANUAL;

    // The ID of the stock, dividend or fixed deposit that created this entry.
    @Column(name = "source_id")
    private Long sourceId;
}