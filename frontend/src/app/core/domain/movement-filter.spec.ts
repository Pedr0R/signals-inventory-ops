import { INITIAL_MOVEMENTS } from './catalog-seed';
import { computeMovementMetrics, filterMovements } from './movement-filter';
import { MovementFilterState } from '../models/movement.models';

describe('movement-filter', () => {
  it('filtra movimentações por busca textual, categoria, direção e origem', () => {
    const filter: MovementFilterState = {
      searchQuery: 'ARM-NVME',
      category: 'estoque',
      direction: 'entrada',
      source: 'manual',
    };

    const result = filterMovements(INITIAL_MOVEMENTS, filter);

    expect(result.length).toBe(1);
    expect(result[0].sku).toBe('ARM-NVME-2048');
  });

  it('calcula métricas de entradas, saídas e volume em pedidos', () => {
    const metrics = computeMovementMetrics(INITIAL_MOVEMENTS);

    expect(metrics.totalMovements).toBe(INITIAL_MOVEMENTS.length);
    expect(metrics.stockInUnits).toBe(10);
    expect(metrics.stockOutUnits).toBe(1);
    expect(metrics.ordersCount).toBe(2);
    expect(metrics.totalMovedCents).toBe(420120 + 289332);
  });
});
