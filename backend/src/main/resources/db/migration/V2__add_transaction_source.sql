ALTER TABLE transactions
    ADD COLUMN source_type VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    ADD COLUMN source_id   BIGINT;

ALTER TABLE transactions
    ADD CONSTRAINT chk_transactions_source_type
        CHECK (source_type IN ('MANUAL', 'ASSET_PURCHASE', 'DIVIDEND', 'FIXED_DEPOSIT')),
    ADD CONSTRAINT chk_transactions_source_link
        CHECK ((source_type = 'MANUAL' AND source_id IS NULL)
            OR (source_type <> 'MANUAL' AND source_id IS NOT NULL));

CREATE INDEX idx_transactions_source ON transactions (source_type, source_id);