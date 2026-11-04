package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.AssetSale;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetSaleRepository extends JpaRepository<AssetSale, Long> {

    List<AssetSale> findByAssetId(Long assetId);
}