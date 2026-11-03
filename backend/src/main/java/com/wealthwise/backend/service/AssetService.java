package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.AssetRequest;
import com.wealthwise.backend.dto.AssetResponse;
import com.wealthwise.backend.entity.Asset;
import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionType;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.exception.ResourceNotFoundException;
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
    public AssetResponse recordAsset(AssetRequest request, User currentUser) {
        String ticker = request.tickerSymbol().trim().toUpperCase();

        Asset asset = new Asset();
        asset.setUser(currentUser);
        asset.setTickerSymbol(ticker);
        asset.setSharesOwned(request.sharesOwned());
        asset.setAveragePurchasePrice(request.averagePurchasePrice());

        if (request.deductFromCash()) {
            BigDecimal totalCost = request.averagePurchasePrice()
                    .multiply(BigDecimal.valueOf(request.sharesOwned()));

            Transaction expense = new Transaction();
            expense.setUser(currentUser);
            expense.setAmount(totalCost);
            expense.setType(TransactionType.EXPENSE);
            expense.setCategory("Investment: " + ticker);
            expense.setTransactionDate(LocalDate.now());
            transactionRepository.save(expense);
        }

        return AssetResponse.from(assetRepository.save(asset));
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> getUserPortfolio(Long userId) {
        return assetRepository.findByUserId(userId)
                .stream()
                .map(AssetResponse::from)
                .toList();
    }

    @Transactional
    public void deleteAsset(Long id, Long userId) {
        Asset asset = assetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));

        assetRepository.delete(asset);
    }
}