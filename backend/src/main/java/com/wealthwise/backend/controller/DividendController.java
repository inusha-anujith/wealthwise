package com.wealthwise.backend.controller;

import com.wealthwise.backend.dto.DividendRequest;
import com.wealthwise.backend.dto.DividendResponse;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.service.DividendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dividends")
@RequiredArgsConstructor
public class DividendController {

    private final DividendService dividendService;

    @PostMapping
    public ResponseEntity<DividendResponse> logDividend(
            @Valid @RequestBody DividendRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(dividendService.recordDividend(request, currentUser));
    }

    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<DividendResponse>> getDividendsByAsset(
            @PathVariable Long assetId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(dividendService.getDividendsForAsset(assetId, currentUser.getId()));
    }
}