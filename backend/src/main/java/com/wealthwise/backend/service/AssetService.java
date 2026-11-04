package com.wealthwise.backend.service;

import com.wealthwise.backend.dto.AssetPriceRequest;
import com.wealthwise.backend.dto.AssetRequest;
import com.wealthwise.backend.dto.AssetResponse;
import com.wealthwise.backend.dto.AssetSaleRequest;
import com.wealthwise.backend.entity.Asset;
import com.wealthwise.backend.entity.AssetSale;
import com.wealthwise.backend.entity.Dividend;
import com.wealthwise.backend.entity.Transaction;
import com.wealthwise.backend.entity.TransactionCategory;
import com.wealthwise.backend.entity.TransactionSource;
import com.wealthwise.backend.entity.User;
import com.wealthwise.backend.exception.ConflictException;
import com.wealthwise.backend.exception.ResourceNotFoundException;
import com.wealthwise.backend.repository.AssetRepository;
import com.wealthwise.backend.repository.AssetSaleRepository;
import com.wealthwise.backend.repository.DividendRepository;
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
    private final AssetSaleRepository assetSaleRepository;
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

            addLedgerEntry(
                    currentUser,
                    TransactionCategory.STOCK_PURCHASE,
                    totalCost,
                    LocalDate.now(),
                    ticker,
                    TransactionSource.ASSET_PURCHASE,
                    savedAsset.getId()
            );
        }

        return toResponse(savedAsset);
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> getUserPortfolio(Long userId) {
        return assetRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AssetResponse updatePrice(Long id, AssetPriceRequest request, Long userId) {
        Asset asset = findOwnedAsset(id, userId);

        asset.setCurrentPrice(request.currentPrice());
        asset.setPriceUpdatedOn(LocalDate.now());

        return toResponse(asset);
    }

    // The sale record, ledger entry and share count change together or not at all.
    @Transactional
    public AssetResponse sellAsset(Long id, AssetSaleRequest request, User currentUser) {
        Asset asset = findOwnedAsset(id, currentUser.getId());

        if (request.sharesSold() > asset.getSharesOwned()) {
            throw new ConflictException("You only own " + asset.getSharesOwned() + " shares of this stock.");
        }

        StockCalculator.Sale sale = StockCalculator.calculateSale(
                request.sharesSold(),
                asset.getAveragePurchasePrice(),
                request.salePrice()
        );

        AssetSale assetSale = new AssetSale();
        assetSale.setAssetId(asset.getId());
        assetSale.setSharesSold(request.sharesSold());
        assetSale.setSalePrice(request.salePrice());
        assetSale.setSaleDate(request.saleDate());
        assetSale.setProceeds(sale.proceeds());
        assetSale.setCostBasis(sale.costBasis());
        assetSale.setRealizedGain(sale.realizedGain());
        AssetSale savedSale = assetSaleRepository.save(assetSale);

        addLedgerEntry(
                currentUser,
                TransactionCategory.STOCK_SALE,
                sale.proceeds(),
                request.saleDate(),
                asset.getTickerSymbol(),
                TransactionSource.ASSET_SALE,
                savedSale.getId()
        );

        asset.setSharesOwned(asset.getSharesOwned() - request.sharesSold());

        return toResponse(asset);
    }

    // All of these deletes succeed together or roll back together.
    @Transactional
    public void deleteAsset(Long id, Long userId) {
        Asset asset = findOwnedAsset(id, userId);

        List<Dividend> dividends = dividendRepository.findByAssetId(asset.getId());
        for (Dividend dividend : dividends) {
            transactionRepository.deleteBySourceTypeAndSourceId(TransactionSource.DIVIDEND, dividend.getId());
        }

        List<AssetSale> sales = assetSaleRepository.findByAssetId(asset.getId());
        for (AssetSale sale : sales) {
            transactionRepository.deleteBySourceTypeAndSourceId(TransactionSource.ASSET_SALE, sale.getId());
        }

        transactionRepository.deleteBySourceTypeAndSourceId(TransactionSource.ASSET_PURCHASE, asset.getId());
        dividendRepository.deleteAll(dividends);
        assetSaleRepository.deleteAll(sales);
        assetRepository.delete(asset);
    }

    private Asset findOwnedAsset(Long id, Long userId) {
        return assetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
    }

    private AssetResponse toResponse(Asset asset) {
        StockCalculator.Position position = StockCalculator.calculatePosition(
                asset.getSharesOwned(),
                asset.getAveragePurchasePrice(),
                asset.getCurrentPrice()
        );

        BigDecimal realizedGain = assetSaleRepository.findByAssetId(asset.getId())
                .stream()
                .map(AssetSale::getRealizedGain)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal dividendsReceived = dividendRepository.findByAssetId(asset.getId())
                .stream()
                .map(Dividend::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AssetResponse.from(asset, position, realizedGain, dividendsReceived);
    }

    private void addLedgerEntry(
            User user,
            TransactionCategory category,
            BigDecimal amount,
            LocalDate date,
            String description,
            TransactionSource source,
            Long sourceId
    ) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setType(category.getType());
        transaction.setAmount(amount);
        transaction.setTransactionDate(date);
        transaction.setDescription(description);
        transaction.setSourceType(source);
        transaction.setSourceId(sourceId);
        transactionRepository.save(transaction);
    }
}