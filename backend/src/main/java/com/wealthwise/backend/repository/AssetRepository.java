package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByUserId(Long userId);

    Optional<Asset> findByIdAndUserId(Long id, Long userId);
}