package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.AssetRequest;
import com.wealthwise.backend.dto.AssetResponse;
import com.wealthwise.backend.entity.Asset;
import com.wealthwise.backend.entity.Dividend;
import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionSource;
import com.wealthwise.backend.entity.TransactionType;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.exception.ResourceNotFoundException;
import com.wealthwise.backend.repository.AssetRepository;
import com.wealthwise.backend.repository.DividendRepository;
import com.wealthwise.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wealthwise.backend.entity.TransactionCategory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final DividendRepository dividendRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public AssetResponse recordAsset(AssetRequest request, User currentUser) {
        String ticker = request.tickerSymbol().trim().toUpperCase();

        Asset asset = new Asset();
        asset.setUser(currentUser);
        asset.setTickerSymbol(ticker);
        asset.setSharesOwned(request.sharesOwned());
        asset.setAveragePurchasePrice(request.averagePurchasePrice());
        Asset savedAsset = assetRepository.save(asset);

        if (request.deductFromCash()) {
            BigDecimal totalCost = request.averagePurchasePrice()
                    .multiply(BigDecimal.valueOf(request.sharesOwned()));

            Transaction expense = new Transaction();
            expense.setUser(currentUser);
            expense.setAmount(totalCost);
            expense.setType(TransactionType.EXPENSE);
            expense.setCategory(TransactionCategory.STOCK_PURCHASE);
            expense.setDescription(ticker);
            expense.setTransactionDate(LocalDate.now());
            expense.setSourceType(TransactionSource.ASSET_PURCHASE);
            expense.setSourceId(savedAsset.getId());
            transactionRepository.save(expense);
        }

        return AssetResponse.from(savedAsset);
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> getUserPortfolio(Long userId) {
        return assetRepository.findByUserId(userId)
                .stream()
                .map(AssetResponse::from)
                .toList();
    }

    // All of these deletes succeed together or roll back together.
    @Transactional
    public void deleteAsset(Long id, Long userId) {
        Asset asset = assetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));

        List<Dividend> dividends = dividendRepository.findByAssetId(asset.getId());
        for (Dividend dividend : dividends) {
            transactionRepository.deleteBySourceTypeAndSourceId(TransactionSource.DIVIDEND, dividend.getId());
        }

        transactionRepository.deleteBySourceTypeAndSourceId(TransactionSource.ASSET_PURCHASE, asset.getId());
        dividendRepository.deleteAll(dividends);
        assetRepository.delete(asset);
    }
}