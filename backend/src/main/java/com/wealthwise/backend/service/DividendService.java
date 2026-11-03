package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.DividendRequest;
import com.wealthwise.backend.dto.DividendResponse;
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

import java.util.List;

@Service
@RequiredArgsConstructor
public class DividendService {

    private final DividendRepository dividendRepository;
    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;

    @Transactional
    public DividendResponse recordDividend(DividendRequest request, User currentUser) {
        Asset asset = findOwnedAsset(request.assetId(), currentUser.getId());

        Dividend dividend = new Dividend();
        dividend.setAsset(asset);
        dividend.setAmount(request.amount());
        dividend.setPaymentDate(request.paymentDate());
        Dividend savedDividend = dividendRepository.save(dividend);

        Transaction income = new Transaction();
        income.setUser(currentUser);
        income.setAmount(request.amount());
        income.setType(TransactionType.INCOME);
        income.setCategory(TransactionCategory.DIVIDEND_INCOME);
        income.setDescription(asset.getTickerSymbol());
        income.setTransactionDate(request.paymentDate());
        income.setSourceType(TransactionSource.DIVIDEND);
        income.setSourceId(savedDividend.getId());
        transactionRepository.save(income);

        return DividendResponse.from(savedDividend);
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