package com.wealthwise.backend.controller;

import com.wealthwise.backend.entity.Dividend;
import com.wealthwise.backend.service.DividendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/*
 * THEORY: REST Controller Architecture & CORS Security
 * -----------------------------------------------------
 * @CrossOrigin(origins = "http://localhost:3000"):
 * Explicitly whitelists the Next.js origin. A bare '@CrossOrigin' without parameters
 * allows any origin, which is insecure in production. Pinning it to port 3000 prevents
 * Cross-Origin Request Forgery (CSRF) and unauthorized domain access.
 *
 * @RestController:
 * A convenience annotation combining @Controller and @ResponseBody. It tells Spring MVC
 * to serialize Java return objects directly into HTTP response bodies as JSON using Jackson.
 *
 * @RequestMapping("/api/dividends"):
 * Defines the root resource path. Every HTTP method inside this class is scoped under
 * the '/api/dividends' URL route.
 *
 * @RequiredArgsConstructor:
 * Lombok annotation that generates a constructor for all 'final' fields. Spring's Inversion
 * of Control (IoC) container detects this constructor and injects the DividendService bean,
 * adhering to constructor-based dependency injection best practices.
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/dividends")
@RequiredArgsConstructor
public class DividendController {

    // Immutable service dependency managed by Spring's application context
    private final DividendService dividendService;

    /*
     * THEORY: Transitive Entity Mapping & Bean Validation
     * ---------------------------------------------------
     * @Valid:
     * Triggers Jakarta Bean Validation on the incoming payload before executing
     * method logic. If constraint annotations (such as @NotNull or @Positive) fail,
     * Spring short-circuits and emits an HTTP 400 Bad Request immediately.
     *
     * @RequestBody:
     * Instructs the HttpMessageConverter to parse the incoming JSON payload and bind
     * it to a new Dividend entity instance.
     *
     * Transitive Foreign Key Resolution:
     * Notice that we do not manually inject @AuthenticationPrincipal User here.
     * A Dividend belongs to an Asset via a @ManyToOne relationship ('asset_id').
     * The Asset entity in the database is ALREADY linked to the User ('user_id').
     * Therefore, Hibernate links the dividend directly to the user's equity holding
     * through the existing relational foreign key graph.
     */
    @PostMapping
    public ResponseEntity<Dividend> logDividend(@Valid @RequestBody Dividend dividend) {
        Dividend savedDividend = dividendService.recordDividend(dividend);
        return ResponseEntity.ok(savedDividend);
    }

    /*
     * THEORY: Path Variables & Idempotent Resource Retrieval
     * -------------------------------------------------------
     * @GetMapping("/asset/{assetId}"):
     * Maps HTTP GET requests for retrieving dividend history associated with a stock.
     *
     * @PathVariable:
     * Extracts the dynamic '{assetId}' segment from the URI and binds it to the
     * Long parameter, allowing database queries scoped to that specific asset.
     */
    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<Dividend>> getDividendsByAsset(@PathVariable Long assetId) {
        return ResponseEntity.ok(dividendService.getDividendsForAsset(assetId));
    }
}