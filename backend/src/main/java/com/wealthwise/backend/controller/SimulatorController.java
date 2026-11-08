package com.wealthwise.backend.controller;

import com.wealthwise.backend.dto.SimulatorRequest;
import com.wealthwise.backend.dto.SimulatorResponse;
import com.wealthwise.backend.service.SimulatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/simulator")
@RequiredArgsConstructor
public class SimulatorController {

    private final SimulatorService simulatorService;

    // POST because the inputs travel in the request body. Nothing is saved.
    @PostMapping
    public ResponseEntity<SimulatorResponse> simulate(@Valid @RequestBody SimulatorRequest request) {
        return ResponseEntity.ok(simulatorService.simulate(request));
    }
}