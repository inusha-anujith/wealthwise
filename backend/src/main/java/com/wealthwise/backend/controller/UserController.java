package com.wealthwise.backend.controller;

import com.wealthwise.backend.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/users")
public class UserController {

    /*
     * THEORY: Context Injection & The Safe Return Pattern.
     * @AuthenticationPrincipal grabs the verified User directly from Spring Security's memory.
     * 
     * However, we CANNOT return the raw 'User' entity. If the User has database relationships 
     * (like a list of Transactions), the JSON serializer will try to read the User, then the 
     * Transactions, then the User attached to those Transactions, causing an Infinite Recursion 
     * crash (500 Error).
     * 
     * Instead, we manually pack only the safe, necessary data into a Map.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal User user) {
        
        Map<String, Object> safeUserData = new HashMap<>();
        safeUserData.put("id", user.getId());
        safeUserData.put("email", user.getEmail());
        
        // Next.js receives a clean, flat JSON object containing only the ID and Email
        return ResponseEntity.ok(safeUserData);
    }
}