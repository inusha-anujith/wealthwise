package com.wealthwise.backend.entity;

/**
 * ENUM (Enumeration): A special Java type used to define collections of constants.
 * Using Enums provides "Type Safety". It prevents developers from passing invalid strings into the database, reducing runtime errors.
 */
public enum TransactionType {
    INCOME,
    EXPENSE
}