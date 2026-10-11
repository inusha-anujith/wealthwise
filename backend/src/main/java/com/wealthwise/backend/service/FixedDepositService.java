package com.wealthwise.backend.service;

import com.wealthwise.backend.entity.FixedDeposit;
import com.wealthwise.backend.repository.FixedDepositRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

// Encapsulating the business logic for managing fixed deposits.
@Service
@RequiredArgsConstructor
public class FixedDepositService {

    private final FixedDepositRepository fixedDepositRepository;

    public FixedDeposit recordFixedDeposit(FixedDeposit fd) {
        return fixedDepositRepository.save(fd);
    }

    public List<FixedDeposit> getUserFixedDeposits(Long userId) {
        return fixedDepositRepository.findByUserId(userId);
    }

    public void deleteFixedDeposit(Long id) {
        fixedDepositRepository.deleteById(id);
    }
}