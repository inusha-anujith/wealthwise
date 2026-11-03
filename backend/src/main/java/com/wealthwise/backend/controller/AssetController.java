package com.wealthwise.backend.controller;

import com.wealthwise.backend.dto.AssetRequest;
import com.wealthwise.backend.dto.AssetResponse;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.service.AssetService;
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
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    public ResponseEntity<AssetResponse> createAsset(
            @Valid @RequestBody AssetRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assetService.recordAsset(request, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<AssetResponse>> getMyPortfolio(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(assetService.getUserPortfolio(currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        assetService.deleteAsset(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}