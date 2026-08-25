package com.wealthwise.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

// Marks this class as a database table for Spring Boot
@Entity
// Specifies the exact table name in PostgreSQL (avoids using the reserved word "user")
@Table(name = "users")
// Lombok magic: Automatically creates Getters and Setters behind the scenes
@Data
public class User {

    // Marks this field as the Primary Key
    @Id
    // Tells PostgreSQL to automatically increment the ID (1, 2, 3...) for new users
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Enforces rules: Email cannot be empty (nullable = false) and must be unique
    @Column(nullable = false, unique = true)
    private String email;

    // Stores the encrypted password. Never store raw passwords!
    @Column(nullable = false)
    private String passwordHash;

    // Restricts the column to 3 characters (e.g., LKR, USD) and sets a default
    @Column(nullable = false, length = 3)
    private String baseCurrency = "LKR"; 
}