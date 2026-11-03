package com.wealthwise.backend.dto;

import com.wealthwise.backend.entity.TransactionCategory;
import com.wealthwise.backend.entity.TransactionType;

public record CategoryResponse(String value, String label, TransactionType type) {
    public static CategoryResponse from(TransactionCategory category) {
        return new CategoryResponse(category.name(), category.getLabel(), category.getType());
    }
}