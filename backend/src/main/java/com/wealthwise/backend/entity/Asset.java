package com.wealthwise.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Ticker symbol is required")
    @Column(nullable = false)
    private String tickerSymbol;

    @Positive(message = "Shares owned must be positive")
    @Column(nullable = false)
    private Integer sharesOwned;

    @Positive(message = "Purchase price must be positive")
    @Column(nullable = false)
    private BigDecimal averagePurchasePrice;

    // This is the new logic flag we added for Next.js!
    @Transient
    private boolean deductFromCash = true;

    // These are the annotations that went missing and caused the crash
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}