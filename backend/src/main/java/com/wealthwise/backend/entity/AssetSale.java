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
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "asset_sales")
public class AssetSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Column(nullable = false)
    private Integer sharesSold;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal salePrice;

    @Column(nullable = false)
    private LocalDate saleDate;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal proceeds;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal costBasis;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal realizedGain;
}