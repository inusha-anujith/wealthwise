package com.wealthwise.backend.controller;

import com.wealthwise.backend.entity.Asset;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * THEORY: Architectural Layering & REST API Controller Design
 * -------------------------------------------------------------
 * @CrossOrigin: Configures Cross-Origin Resource Sharing (CORS) policy. Browsers block 
 * frontend requests from http://localhost:3000 to http://localhost:8080 by default under the 
 * Same-Origin Policy. Whitelisting the origin allows Next.js to make AJAX/fetch requests safely.
 *
 * @RestController: Combines @Controller and @ResponseBody. Tells Spring to automatically serialize 
 * returned Java objects (like Asset or List<Asset>) directly into JSON format in the HTTP response body.
 *
 * @RequestMapping: Establishes the root URL routing segment ("/api/assets") for all handlers in this class.
 *
 * @RequiredArgsConstructor: Generates a parameterized constructor for all 'final' fields (Lombok),
 * enabling constructor-based Dependency Injection (DI) without manually writing boilerplate @Autowired code.
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    // Immutable service reference adhering to Inversion of Control (IoC)
    private final AssetService assetService;

    /*
     * THEORY: Cryptographic Identity Binding & Foreign Key Integrity
     * ----------------------------------------------------------------
     * Problem Solved: In PostgreSQL, the 'assets' table maintains a foreign key constraint (user_id NOT NULL).
     * If the client sends an Asset payload without a populated User reference, Hibernate generates an INSERT
     * statement with 'user_id = null', triggering a DataIntegrityViolationException.
     *
     * @AuthenticationPrincipal: Directly retrieves the verified User principal stored in the 
     * SecurityContextHolder by your JwtAuthenticationFilter. Because the token's cryptographic signature 
     * has already been verified, we do not query the database or trust an ID sent in the request body.
     *
     * Insecure Direct Object Reference (IDOR) Mitigation: We explicitly set asset.setUser(currentUser) 
     * server-side, guaranteeing that users can only create asset holdings inside their own account.
     */
    @PostMapping
    public ResponseEntity<Asset> createAsset(
            @Valid @RequestBody Asset asset,
            @AuthenticationPrincipal User currentUser
    ) {
        // Enforce entity relationship prior to database persistence
        asset.setUser(currentUser);
        Asset savedAsset = assetService.recordAsset(asset);
        return ResponseEntity.ok(savedAsset);
    }

    /*
     * THEORY: Idempotent Read Operations & Parameter Mapping
     * --------------------------------------------------------
     * @GetMapping: Maps HTTP GET requests to read portfolio records without mutating server state.
     * @PathVariable: Extracts the URI path segment variable ({userId}) and binds it to the Java Long parameter.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Asset>> getUserPortfolio(@PathVariable Long userId) {
        List<Asset> portfolio = assetService.getUserPortfolio(userId);
        return ResponseEntity.ok(portfolio);
    }

    /*
     * THEORY: Resource Deletion & Standard HTTP Status Codes
     * -------------------------------------------------------
     * @DeleteMapping: Maps HTTP DELETE requests for resource liquidation/removal.
     * ResponseEntity.noContent(): Emits HTTP status code 204 (No Content). This is the RFC REST standard
     * for operations that succeed but have no payload body to send back, conserving network bandwidth.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}