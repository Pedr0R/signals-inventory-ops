import {
  MovementFilterState,
  MovementSummaryMetrics,
  SystemMovement,
} from '../models/movement.models';

function matchesMovementSearch(movement: SystemMovement, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const titleMatch = movement.title.toLowerCase().includes(normalizedQuery);
  const detailsMatch = movement.details.toLowerCase().includes(normalizedQuery);
  const skuMatch = movement.sku?.toLowerCase().includes(normalizedQuery) ?? false;
  const orderMatch = movement.orderId?.toLowerCase().includes(normalizedQuery) ?? false;
  return titleMatch || detailsMatch || skuMatch || orderMatch;
}

/**
 * Filtra a lista de movimentações do sistema por busca textual, categoria, direção e origem.
 *
 * @example
 * const visible = filterMovements(store.movements(), filterState);
 */
export function filterMovements(
  movements: readonly SystemMovement[],
  filter: MovementFilterState,
): readonly SystemMovement[] {
  const normalizedQuery = filter.searchQuery.trim().toLowerCase();

  return movements.filter((movement) => {
    const categoryOk = filter.category === 'all' || movement.category === filter.category;
    const directionOk = filter.direction === 'all' || movement.direction === filter.direction;
    const sourceOk = filter.source === 'all' || movement.source === filter.source;
    return categoryOk && directionOk && sourceOk && matchesMovementSearch(movement, normalizedQuery);
  });
}

/**
 * Calcula métricas consolidadas a partir das movimentações filtradas.
 *
 * @example
 * const summary = computeMovementMetrics(filteredMovements);
 */
export function computeMovementMetrics(
  movements: readonly SystemMovement[],
): MovementSummaryMetrics {
  let stockInUnits = 0;
  let stockOutUnits = 0;
  let ordersCount = 0;
  let totalMovedCents = 0;

  for (const movement of movements) {
    if (movement.category === 'estoque' && movement.quantityDelta !== null) {
      if (movement.quantityDelta > 0) {
        stockInUnits += movement.quantityDelta;
      } else if (movement.quantityDelta < 0) {
        stockOutUnits += Math.abs(movement.quantityDelta);
      }
    }

    if (movement.category === 'pedido') {
      ordersCount += 1;
      totalMovedCents += movement.amountCents ?? 0;
    }
  }

  return {
    totalMovements: movements.length,
    stockInUnits,
    stockOutUnits,
    ordersCount,
    totalMovedCents,
  };
}
