package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.SalaryProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SalaryProfileRepository extends JpaRepository<SalaryProfile, Long> {

    Optional<SalaryProfile> findByUserId(Long userId);
}