CREATE TABLE IF NOT EXISTS products (
    id                  VARCHAR(64) PRIMARY KEY,
    sku                 VARCHAR(40) NOT NULL UNIQUE,
    name                VARCHAR(160) NOT NULL,
    category            VARCHAR(40) NOT NULL,
    unit_price_cents    BIGINT NOT NULL CHECK (unit_price_cents >= 0),
    stock_quantity      INTEGER NOT NULL CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER NOT NULL CHECK (low_stock_threshold >= 0),
    warehouse_zone      VARCHAR(60) NOT NULL,
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS system_movements (
    id             VARCHAR(64) PRIMARY KEY,
    occurred_at    TIMESTAMPTZ NOT NULL,
    category       VARCHAR(24) NOT NULL,
    direction      VARCHAR(24) NOT NULL,
    title          VARCHAR(180) NOT NULL,
    details        VARCHAR(500) NOT NULL,
    sku            VARCHAR(40),
    order_id       VARCHAR(64),
    quantity_delta INTEGER,
    amount_cents   BIGINT,
    source         VARCHAR(32) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_movements_occurred_at ON system_movements (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_movements_category ON system_movements (category);
