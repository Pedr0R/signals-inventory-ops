import {
  computeInventoryMetrics,
  filterAndSortCatalog,
  paginateItems,
  resolveStockStatus,
} from './catalog-filter';
import { INITIAL_CATALOG } from './catalog-seed';
import { CatalogFilterState, ProductItem } from '../models/inventory.models';

describe('catalog-filter', () => {
  it('classifica status de estoque corretamente', () => {
    const outOfStock: ProductItem = { ...INITIAL_CATALOG[0], stockQuantity: 0 };
    const lowStock: ProductItem = { ...INITIAL_CATALOG[0], stockQuantity: 4, lowStockThreshold: 4 };
    const healthy: ProductItem = { ...INITIAL_CATALOG[0], stockQuantity: 10, lowStockThreshold: 4 };

    expect(resolveStockStatus(outOfStock)).toBe('out-of-stock');
    expect(resolveStockStatus(lowStock)).toBe('low-stock');
    expect(resolveStockStatus(healthy)).toBe('in-stock');
  });

  it('filtra por texto, categoria e ordena por menor preço', () => {
    const filter: CatalogFilterState = {
      searchQuery: 'RED-',
      category: 'redes',
      stockStatus: 'in-stock',
      sortBy: 'price-asc',
    };

    const result = filterAndSortCatalog(INITIAL_CATALOG, filter);

    expect(result.length).toBe(2);
    expect(result[0].sku).toBe('RED-AP-W7');
    expect(result[1].sku).toBe('RED-SW24-10G');
  });

  it('calcula métricas globais do inventário', () => {
    const sample: readonly ProductItem[] = [
      { ...INITIAL_CATALOG[0], unitPriceCents: 1000, stockQuantity: 5, lowStockThreshold: 2 },
      { ...INITIAL_CATALOG[1], unitPriceCents: 2000, stockQuantity: 2, lowStockThreshold: 3 },
      { ...INITIAL_CATALOG[2], unitPriceCents: 3000, stockQuantity: 0, lowStockThreshold: 2 },
    ];

    const metrics = computeInventoryMetrics(sample);

    expect(metrics.totalSkus).toBe(3);
    expect(metrics.totalUnits).toBe(7);
    expect(metrics.lowStockCount).toBe(1);
    expect(metrics.outOfStockCount).toBe(1);
    expect(metrics.totalValuationCents).toBe(9000);
  });

  it('valida tamanho de página inválido com mensagem descritiva', () => {
    expect(() => paginateItems(INITIAL_CATALOG, 1, 0)).toThrow(
      'Tamanho de página inválido: "0". Esperado inteiro positivo >= 1.',
    );
  });
});
