package com.wealthwise.backend.controller;

import com.wealthwise.backend.entity.FixedDeposit;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.service.FixedDepositService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * THEORY: Principal Binding & Entity Integrity
 * --------------------------------------------
 * 1. @CrossOrigin: Whitelists http://localhost:3000 to prevent CORS blocking.
 * 2. @AuthenticationPrincipal: Injects the authenticated User directly from Spring Security context.
 * 3. Foreign Key Association: fixedDeposit.setUser(currentUser) links the user_id foreign key
 *    before passing the entity to FixedDepositService for persistence.
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/fixed-deposits")
@RequiredArgsConstructor
public class FixedDepositController {

    private final FixedDepositService fixedDepositService;

    @PostMapping
    public ResponseEntity<FixedDeposit> addFixedDeposit(
            @Valid @RequestBody FixedDeposit fixedDeposit,
            @AuthenticationPrincipal User currentUser
    ) {
        // Enforce user ownership server-side to fulfill the non-null user_id constraint
        fixedDeposit.setUser(currentUser);
        FixedDeposit savedDeposit = fixedDepositService.recordFixedDeposit(fixedDeposit);
        return ResponseEntity.ok(savedDeposit);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FixedDeposit>> getUserFixedDeposits(@PathVariable Long userId) {
        List<FixedDeposit> deposits = fixedDepositService.getUserFixedDeposits(userId);
        return ResponseEntity.ok(deposits);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFixedDeposit(@PathVariable Long id) {
        fixedDepositService.deleteFixedDeposit(id);
        return ResponseEntity.noContent().build();
    }
}