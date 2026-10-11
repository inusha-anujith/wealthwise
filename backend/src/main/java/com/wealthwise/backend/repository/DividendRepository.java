package com.wealthwise.backend.repository;

import com.wealthwise.backend.entity.Dividend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// @Repository marks this as a Data Access Object (DAO) for the persistence layer.
@Repository
public interface DividendRepository extends JpaRepository<Dividend, Long> {
    
    // Spring Data JPA automatically converts this method name into a SQL query: SELECT * WHERE asset_id = ?
    List<Dividend> findByAssetId(Long assetId);
}