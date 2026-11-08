package com.wealthwise.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

// Builds the login cookie in one place, so every route uses the same security settings.
@Component
public class AuthCookies {

    public static final String COOKIE_NAME = "jwt";
    private static final Duration LIFETIME = Duration.ofHours(24);

    private final boolean secure;

    public AuthCookies(@Value("${app.cookie-secure:false}") boolean secure) {
        this.secure = secure;
    }

    public ResponseCookie create(String token) {
        return build(token, LIFETIME);
    }

    // A cookie with the same name and zero lifetime tells the browser to delete it.
    public ResponseCookie clear() {
        return build("", Duration.ZERO);
    }

    private ResponseCookie build(String value, Duration maxAge) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAge)
                .build();
    }
}