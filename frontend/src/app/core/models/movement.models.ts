export type MovementCategory = 'estoque' | 'carrinho' | 'pedido' | 'logistica' | 'sistema';

export type MovementDirection = 'entrada' | 'saida' | 'neutro';

export type MovementSource = 'manual' | 'armazem-ao-vivo' | 'sistema';

export interface SystemMovement {
  readonly id: string;
  readonly timestampIso: string;
  readonly category: MovementCategory;
  readonly direction: MovementDirection;
  readonly title: string;
  readonly details: string;
  readonly sku: string | null;
  readonly orderId: string | null;
  readonly quantityDelta: number | null;
  readonly amountCents: number | null;
  readonly source: MovementSource;
}

export interface MovementFilterState {
  readonly searchQuery: string;
  readonly category: MovementCategory | 'all';
  readonly direction: MovementDirection | 'all';
  readonly source: MovementSource | 'all';
}

export interface MovementSummaryMetrics {
  readonly totalMovements: number;
  readonly stockInUnits: number;
  readonly stockOutUnits: number;
  readonly ordersCount: number;
  readonly totalMovedCents: number;
}
