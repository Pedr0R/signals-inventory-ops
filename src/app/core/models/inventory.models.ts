export type ProductCategory = 'hardware' | 'perifericos' | 'redes' | 'armazenamento';

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export type CatalogSortField = 'name' | 'price-asc' | 'price-desc' | 'stock-desc';

export interface ProductItem {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly category: ProductCategory;
  readonly unitPriceCents: number;
  readonly stockQuantity: number;
  readonly lowStockThreshold: number;
  readonly warehouseZone: string;
}

export interface CatalogFilterState {
  readonly searchQuery: string;
  readonly category: ProductCategory | 'all';
  readonly stockStatus: StockStatus | 'all';
  readonly sortBy: CatalogSortField;
}

export interface InventoryMetrics {
  readonly totalSkus: number;
  readonly totalUnits: number;
  readonly lowStockCount: number;
  readonly outOfStockCount: number;
  readonly totalValuationCents: number;
}
