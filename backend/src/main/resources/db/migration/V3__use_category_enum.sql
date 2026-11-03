-- Keep the old free-text value (such as "Investment: JKH.N") as the description.
UPDATE transactions
SET description = COALESCE(description, category);

UPDATE transactions
SET category = CASE
    WHEN source_type = 'ASSET_PURCHASE' THEN 'STOCK_PURCHASE'
    WHEN source_type = 'FIXED_DEPOSIT' THEN 'FIXED_DEPOSIT'
    WHEN source_type = 'DIVIDEND' THEN 'DIVIDEND_INCOME'
    WHEN type = 'INCOME' AND category ILIKE '%salary%' THEN 'SALARY'
    WHEN type = 'INCOME' THEN 'OTHER_INCOME'
    ELSE 'OTHER_EXPENSE'
END;

ALTER TABLE transactions
    ALTER COLUMN category TYPE VARCHAR(30);

ALTER TABLE transactions
    ADD CONSTRAINT chk_transactions_category
        CHECK (
            (type = 'INCOME' AND category IN (
                'SALARY', 'SIDE_INCOME', 'RENTAL_INCOME', 'FD_INTEREST',
                'OTHER_INCOME', 'DIVIDEND_INCOME'
            ))
            OR
            (type = 'EXPENSE' AND category IN (
                'HOUSEHOLD', 'HOUSING', 'LOANS', 'INSURANCE', 'UTILITIES', 'TRANSPORT',
                'HEALTH', 'EDUCATION_FEES', 'DINING_ENTERTAINMENT', 'SHOPPING',
                'OTHER_EXPENSE', 'STOCK_PURCHASE', 'FIXED_DEPOSIT'
            ))
        );