/*
 * This defines the package location. It tells the Java compiler exactly where 
 * this specific blueprint lives within my overall project folder structure.
 */
package com.wealthwise.backend.entity;

/* 
 * These imports bring in external tools I need to build this class.
 * 'jakarta.persistence' brings in the database mapping tools.
 * 'lombok' brings in shortcuts to generate boilerplate code.
 * 'java.math' and 'java.time' bring in strict data types for enterprise finance.
 */
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

/* 
 * @Data is a Lombok annotation. At compile time, it automatically writes all the 
 * Getters, Setters, and Constructors for me so my file stays clean and readable.
 * @Entity tells the Spring Boot framework that this class isn't just standard code; 
 * it represents a real, physical table in the PostgreSQL database.
 * @Table explicitly names that database table "dividends" so it is easy to query.
 */
@Data
@Entity
@Table(name = "dividends")
public class Dividend {

    /* 
     * @Id marks this specific variable as the Primary Key for the database table.
     * @GeneratedValue(strategy = GenerationType.IDENTITY) tells PostgreSQL to take 
     * control of this ID and automatically count up (1, 2, 3...) for every new row.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* 
     * I explicitly use 'BigDecimal' here instead of a standard 'double'. 
     * Standard decimals in programming suffer from floating-point rounding errors. 
     * Enterprise financial applications always use BigDecimal for exact currency math.
     * @Column(nullable = false) is a strict database constraint ensuring a dividend 
     * cannot be saved if the amount is missing.
     */
    @Column(nullable = false)
    private BigDecimal amount;

    /* 
     * 'LocalDate' specifically tracks the year, month, and day. It intentionally 
     * ignores hours, minutes, and timezones, making it the perfect data type for 
     * logging the exact calendar day a company issued a payout.
     */
    @Column(nullable = false)
    private LocalDate paymentDate;

    /*
     * This is the core architectural link: The Many-To-One Relationship.
     * @ManyToOne defines the logic: "Many separate dividend payments over the years 
     * can all belong to One specific stock asset."
     * @JoinColumn physically creates a Foreign Key column named 'asset_id' in the 
     * dividends table. This column holds the ID of the parent asset, forever linking 
     * the cash payout back to the stock that generated it.
     */
    @ManyToOne
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;
}