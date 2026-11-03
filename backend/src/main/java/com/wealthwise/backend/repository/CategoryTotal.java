package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.TransactionCategory;

import java.math.BigDecimal;

public interface CategoryTotal {
    TransactionCategory getCategory();

    BigDecimal getTotal();
}