package com.wealthwise.backend.dto;

import com.wealthwise.backend.entity.BudgetGroup;

import java.math.BigDecimal;

public record CategoryTotalResponse(String category, String label, BudgetGroup group, BigDecimal total) {
}