package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.DividendRequest;
import com.wealthwise.backend.dto.DividendResponse;
import com.wealthwise.backend.entity.Asset;
import com.wealthwise.backend.entity.Dividend;
import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionType;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.exception.ResourceNotFoundException;
import com.wealthwise.backend.repository.AssetRepository;
import com.wealthwise.backend.repository.DividendRepository;
import com.wealthwise.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DividendService {

    private final DividendRepository dividendRepository;
    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;

    @Transactional
    public DividendResponse recordDividend(DividendRequest request, User currentUser) {
        // A user can only add a dividend to their own asset.
        Asset asset = findOwnedAsset(request.assetId(), currentUser.getId());

        Transaction income = new Transaction();
        income.setUser(currentUser);
        income.setAmount(request.amount());
        income.setType(TransactionType.INCOME);
        income.setCategory("Dividend Income: " + asset.getTickerSymbol());
        income.setTransactionDate(request.paymentDate());
        transactionRepository.save(income);

        Dividend dividend = new Dividend();
        dividend.setAsset(asset);
        dividend.setAmount(request.amount());
        dividend.setPaymentDate(request.paymentDate());

        return DividendResponse.from(dividendRepository.save(dividend));
    }

    @Transactional(readOnly = true)
    public List<DividendResponse> getDividendsForAsset(Long assetId, Long userId) {
        Asset asset = findOwnedAsset(assetId, userId);

        return dividendRepository.findByAssetId(asset.getId())
                .stream()
                .map(DividendResponse::from)
                .toList();
    }

    private Asset findOwnedAsset(Long assetId, Long userId) {
        return assetRepository.findByIdAndUserId(assetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
    }
}