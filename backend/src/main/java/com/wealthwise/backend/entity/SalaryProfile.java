package com.wealthwise.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "salary_profiles")
public class SalaryProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal grossSalary;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal epfEarnings;

    @Column(nullable = false)
    private Integer needsPercent;

    @Column(nullable = false)
    private Integer wantsPercent;

    @Column(nullable = false)
    private Integer savingsPercent;

    @Column(nullable = false)
    private Integer emergencyFundMonths;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal highInterestDebt;
}