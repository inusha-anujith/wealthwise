package com.wealthwise.backend.controller;

import com.wealthwise.backend.config.AuthCookies;
import com.wealthwise.backend.dto.AuthRequest;
import com.wealthwise.backend.dto.AuthResponse;
import com.wealthwise.backend.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.wealthwise.backend.dto.SignupRequest;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;
    private final AuthCookies authCookies;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody SignupRequest request) {
        String token = service.register(request.email(), request.password());
        return withCookie(authCookies.create(token), request.email());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@Valid @RequestBody AuthRequest request) {
        String token = service.authenticate(request.email(), request.password());
        return withCookie(authCookies.create(token), request.email());
    }

    // Only the server can delete an HttpOnly cookie, because JavaScript can't touch it.
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, authCookies.clear().toString())
                .build();
    }

    private ResponseEntity<AuthResponse> withCookie(ResponseCookie cookie, String email) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(email));
    }
}