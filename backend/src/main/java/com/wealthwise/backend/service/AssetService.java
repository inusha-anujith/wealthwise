package com.wealthwise.backend.service;

import com.wealthwise.backend.entity.Asset;
import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionType; // NEW: Importing the Enum
import com.wealthwise.backend.repository.AssetRepository;
import com.wealthwise.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository; 

    @Transactional 
    public Asset recordAsset(Asset asset) {
        
        if (asset.isDeductFromCash()) {
            
            BigDecimal totalCost = asset.getAveragePurchasePrice()
                    .multiply(new BigDecimal(asset.getSharesOwned()));

            Transaction autoExpense = new Transaction();
            autoExpense.setUser(asset.getUser());
            autoExpense.setAmount(totalCost);
            
            // FIX: Using the official Enum instead of a raw String
            autoExpense.setType(TransactionType.EXPENSE); 
            
            autoExpense.setCategory("Investment: " + asset.getTickerSymbol());
            autoExpense.setTransactionDate(LocalDate.now());

            transactionRepository.save(autoExpense);
        }

        return assetRepository.save(asset);
    }

    public List<Asset> getUserPortfolio(Long userId) {
        return assetRepository.findByUserId(userId);
    }
    /*  
     * Here, I am implementing the 'Delete' portion of the CRUD lifecycle.
     * I rely on Spring Data JPA's built-in .deleteById() method. 
     * In a production environment, I might implement a Soft Delete(setting an isActive flag to false), 
     * but for this specific financial tracker, a hard database delete ensures accurate recalculations.
     */
    public void deleteAsset(Long id) {
        assetRepository.deleteById(id);
    }
}