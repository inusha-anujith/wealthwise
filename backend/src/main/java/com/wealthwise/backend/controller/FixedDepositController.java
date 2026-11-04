package com.wealthwise.backend.controller;

import com.wealthwise.backend.dto.FixedDepositRequest;
import com.wealthwise.backend.dto.FixedDepositResponse;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.service.FixedDepositService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fixed-deposits")
@RequiredArgsConstructor
public class FixedDepositController {

    private final FixedDepositService fixedDepositService;

    @PostMapping
    public ResponseEntity<FixedDepositResponse> addFixedDeposit(
            @Valid @RequestBody FixedDepositRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fixedDepositService.recordFixedDeposit(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<FixedDepositResponse>> getMyFixedDeposits(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(fixedDepositService.getUserFixedDeposits(currentUser.getId()));
    }


    @PostMapping("/{id}/mature")
    public ResponseEntity<FixedDepositResponse> matureFixedDeposit(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(fixedDepositService.matureFixedDeposit(id, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFixedDeposit(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        fixedDepositService.deleteFixedDeposit(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}