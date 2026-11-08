package com.wealthwise.backend.service;

import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.exception.ConflictException;
import com.wealthwise.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// Creates accounts, checks passwords and issues JWTs.
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // Returns a new JWT for the new account.
    public String register(String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setBaseCurrency("LKR");
        userRepository.save(user);

        return jwtService.generateToken(user);
    }

    // Throws BadCredentialsException if the email or password is wrong; otherwise returns a JWT.
    public String authenticate(String email, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));

        User user = userRepository.findByEmail(email).orElseThrow();
        return jwtService.generateToken(user);
    }
}