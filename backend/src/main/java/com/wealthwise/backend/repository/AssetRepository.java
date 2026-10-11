package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// JpaRepository provides built-in methods like .save() and .findAll()
public interface AssetRepository extends JpaRepository<Asset, Long> {
    
    // Custom method to fetch only the stocks owned by a specific user
    List<Asset> findByUserId(Long userId);
}