package com.wealthwise.backend.controller;

import com.wealthwise.backend.dto.SalaryPlanResponse;
import com.wealthwise.backend.dto.SalaryProfileRequest;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.service.SalaryPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/salary-plan")
@RequiredArgsConstructor
public class SalaryPlanController {

    private final SalaryPlanService salaryPlanService;

    @GetMapping
    public ResponseEntity<SalaryPlanResponse> getPlan(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(salaryPlanService.getPlan(currentUser.getId(), month));
    }

    @PutMapping
    public ResponseEntity<SalaryPlanResponse> saveProfile(
            @Valid @RequestBody SalaryProfileRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(salaryPlanService.saveProfile(request, currentUser.getId()));
    }
}