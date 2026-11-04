package com.wealthwise.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

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

    // Zero means the stock has been fully sold, but its history is kept.
    @PositiveOrZero(message = "Shares owned cannot be negative")
    @Column(nullable = false)
    private Integer sharesOwned;

    @Positive(message = "Purchase price must be positive")
    @Column(nullable = false)
    private BigDecimal averagePurchasePrice;

    @Column(name = "current_price", precision = 15, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "price_updated_on")
    private LocalDate priceUpdatedOn;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}