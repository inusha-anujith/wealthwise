package com.wealthwise.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Entity
@Table(name = "investment_tax_rules")
public class InvestmentTaxRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate effectiveFrom;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal fdInterestWhtRate;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal dividendWhtRate;

    @Column(nullable = false, length = 500)
    private String sourceNote;
}