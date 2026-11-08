package com.wealthwise.backend.dto;

// The token is sent in an HttpOnly cookie, never in the response body.
public record AuthResponse(String email) {
}