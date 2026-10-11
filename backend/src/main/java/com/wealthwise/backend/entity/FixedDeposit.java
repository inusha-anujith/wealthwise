package com.wealthwise.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

// This entity maps to the 'fixed_deposits' table to track low-risk capital allocation.
@Data
@Entity
@Table(name = "fixed_deposits")
public class FixedDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Storing the institution name (e.g., HNB, Commercial Bank) to allow for future API integrations.
    @Column(nullable = false)
    private String bankName;

    @Column(nullable = false)
    private BigDecimal principalAmount;

    @Column(nullable = false)
    private BigDecimal interestRate; // Annual interest rate percentage

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private Integer durationMonths;

    // Linking the deposit to a specific user to maintain data isolation.
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}