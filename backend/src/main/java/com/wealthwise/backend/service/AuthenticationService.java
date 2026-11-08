package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.AuthRequest;
import com.wealthwise.backend.entity.User;
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
    public String register(AuthRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setBaseCurrency("LKR");
        userRepository.save(user);

        return jwtService.generateToken(user);
    }

    // Throws an exception if the email or password is wrong; otherwise returns a JWT.
    public String authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        return jwtService.generateToken(user);
    }
}