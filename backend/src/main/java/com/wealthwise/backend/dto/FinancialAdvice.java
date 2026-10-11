package com.wealthwise.backend.dto;

import lombok.Data;

// A DTO (Data Transfer Object) is used to send custom, calculated data to the frontend without tying it to a database table.
@Data
public class FinancialAdvice {
    private String status;
    private String message;
}