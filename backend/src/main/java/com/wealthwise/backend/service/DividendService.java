package com.wealthwise.backend.service;

import com.wealthwise.backend.entity.Asset;
import com.wealthwise.backend.entity.Dividend;
import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionType;
import com.wealthwise.backend.repository.AssetRepository;
import com.wealthwise.backend.repository.DividendRepository;
import com.wealthwise.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

// @Service defines this class as the core Business Logic layer.
@Service
@RequiredArgsConstructor
public class DividendService {

    private final DividendRepository dividendRepository;
    private final TransactionRepository transactionRepository;
    
    // We added AssetRepository so we can fetch the full stock details from the database using just the ID.
    private final AssetRepository assetRepository;

    // @Transactional ensures if one database save fails, everything rolls back safely.
    @Transactional
    public Dividend recordDividend(Dividend dividend) {
        
        // Next.js only sent us a partial object with an ID. We must query the DB for the full Asset to avoid a NullPointerException.
        Asset fullAsset = assetRepository.findById(dividend.getAsset().getId())
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        
        // We re-attach the fully loaded asset back to the dividend before saving.
        dividend.setAsset(fullAsset);

        // 1. Create the automated cash flow entry
        Transaction autoIncome = new Transaction();
        
        // Now that we have the full asset, we can safely access the User who owns it!
        autoIncome.setUser(fullAsset.getUser());
        autoIncome.setAmount(dividend.getAmount());
        autoIncome.setType(TransactionType.INCOME);
        autoIncome.setCategory("Dividend Income: " + fullAsset.getTickerSymbol());
        autoIncome.setTransactionDate(LocalDate.now());

        // 2. Save to the cash flow system
        transactionRepository.save(autoIncome);

        // 3. Save to the dividend tracking system
        return dividendRepository.save(dividend);
    }

    public List<Dividend> getDividendsForAsset(Long assetId) {
        return dividendRepository.findByAssetId(assetId);
    }
}