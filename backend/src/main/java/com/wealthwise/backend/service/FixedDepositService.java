package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.FixedDepositRequest;
import com.wealthwise.backend.dto.FixedDepositResponse;
import com.wealthwise.backend.entity.FixedDeposit;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.exception.ResourceNotFoundException;
import com.wealthwise.backend.repository.FixedDepositRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FixedDepositService {

    private final FixedDepositRepository fixedDepositRepository;

    @Transactional
    public FixedDepositResponse recordFixedDeposit(FixedDepositRequest request, User currentUser) {
        FixedDeposit deposit = new FixedDeposit();
        deposit.setUser(currentUser);
        deposit.setBankName(request.bankName());
        deposit.setPrincipalAmount(request.principalAmount());
        deposit.setInterestRate(request.interestRate());
        deposit.setStartDate(request.startDate());
        deposit.setDurationMonths(request.durationMonths());

        return FixedDepositResponse.from(fixedDepositRepository.save(deposit));
    }

    @Transactional(readOnly = true)
    public List<FixedDepositResponse> getUserFixedDeposits(Long userId) {
        return fixedDepositRepository.findByUserId(userId)
                .stream()
                .map(FixedDepositResponse::from)
                .toList();
    }

    @Transactional
    public void deleteFixedDeposit(Long id, Long userId) {
        FixedDeposit deposit = fixedDepositRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Fixed deposit not found"));

        fixedDepositRepository.delete(deposit);
    }
}