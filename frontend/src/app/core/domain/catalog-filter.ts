import {
  CatalogFilterState,
  CatalogSortField,
  InventoryMetrics,
  ProductItem,
  StockStatus,
} from '../models/inventory.models';

/**
 * Classifica a situação de estoque de um produto com base no limite mínimo.
 *
 * @example
 * const status = resolveStockStatus(product);
 */
export function resolveStockStatus(item: ProductItem): StockStatus {
  if (item.stockQuantity <= 0) {
    return 'out-of-stock';
  }

  if (item.stockQuantity <= item.lowStockThreshold) {
    return 'low-stock';
  }

  return 'in-stock';
}

function matchesSearchQuery(item: ProductItem, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const nameMatch = item.name.toLowerCase().includes(normalizedQuery);
  const skuMatch = item.sku.toLowerCase().includes(normalizedQuery);
  const zoneMatch = item.warehouseZone.toLowerCase().includes(normalizedQuery);
  return nameMatch || skuMatch || zoneMatch;
}

function compareProducts(left: ProductItem, right: ProductItem, sortBy: CatalogSortField): number {
  switch (sortBy) {
    case 'price-asc':
      return left.unitPriceCents - right.unitPriceCents;
    case 'price-desc':
      return right.unitPriceCents - left.unitPriceCents;
    case 'stock-desc':
      return right.stockQuantity - left.stockQuantity;
    case 'name':
      return left.name.localeCompare(right.name, 'pt-BR');
  }
}

/**
 * Filtra e ordena os itens do catálogo conforme os critérios selecionados.
 *
 * @example
 * const visible = filterAndSortCatalog(items, filterState);
 */
export function filterAndSortCatalog(
  items: readonly ProductItem[],
  filter: CatalogFilterState,
): readonly ProductItem[] {
  const normalizedQuery = filter.searchQuery.trim().toLowerCase();

  const filtered = items.filter((item) => {
    const categoryOk = filter.category === 'all' || item.category === filter.category;
    const stockOk = filter.stockStatus === 'all' || resolveStockStatus(item) === filter.stockStatus;
    return categoryOk && stockOk && matchesSearchQuery(item, normalizedQuery);
  });

  return [...filtered].sort((left, right) => compareProducts(left, right, filter.sortBy));
}

/**
 * Calcula indicadores agregados de inventário a partir dos itens do catálogo.
 *
 * @example
 * const metrics = computeInventoryMetrics(catalog);
 */
export function computeInventoryMetrics(items: readonly ProductItem[]): InventoryMetrics {
  let totalUnits = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalValuationCents = 0;

  for (const item of items) {
    totalUnits += item.stockQuantity;
    totalValuationCents += item.stockQuantity * item.unitPriceCents;
    const status = resolveStockStatus(item);
    if (status === 'low-stock') {
      lowStockCount += 1;
    } else if (status === 'out-of-stock') {
      outOfStockCount += 1;
    }
  }

  return {
    totalSkus: items.length,
    totalUnits,
    lowStockCount,
    outOfStockCount,
    totalValuationCents,
  };
}

/**
 * Fatia uma lista para a página informada respeitando os limites válidos.
 *
 * @example
 * const pageItems = paginateItems(filteredCatalog, 1, 6);
 */
export function paginateItems<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): readonly T[] {
  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new Error(`Tamanho de página inválido: "${pageSize}". Esperado inteiro positivo >= 1.`);
  }

  const safePage = Math.max(1, Math.floor(page));
  const startIndex = (safePage - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}
