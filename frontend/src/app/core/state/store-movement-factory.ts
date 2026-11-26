import { ProductItem } from '../models/inventory.models';
import {
  MovementCategory,
  MovementDirection,
  MovementSource,
  SystemMovement,
} from '../models/movement.models';
import { OrderRecord } from '../models/order.models';

export interface MovementDraft {
  readonly category: MovementCategory;
  readonly direction: MovementDirection;
  readonly title: string;
  readonly details: string;
  readonly sku?: string | null;
  readonly orderId?: string | null;
  readonly quantityDelta?: number | null;
  readonly amountCents?: number | null;
  readonly source?: MovementSource;
}

/**
 * Constrói uma entrada imutável de movimentação do sistema com identificador único.
 *
 * @example
 * const movement = createSystemMovement(1, { category: 'estoque', direction: 'entrada', title: 'Reposição', details: '+5 un.' });
 */
export function createSystemMovement(sequence: number, draft: MovementDraft): SystemMovement {
  return {
    id: `mov-${Date.now()}-${sequence}`,
    timestampIso: new Date().toISOString(),
    category: draft.category,
    direction: draft.direction,
    title: draft.title,
    details: draft.details,
    sku: draft.sku ?? null,
    orderId: draft.orderId ?? null,
    quantityDelta: draft.quantityDelta ?? null,
    amountCents: draft.amountCents ?? null,
    source: draft.source ?? 'manual',
  };
}

/**
 * Cria o par de movimentações (pedido + saída consolidada de estoque) ao emitir um pedido.
 *
 * @example
 * const drafts = createOrderSubmissionDrafts(order);
 */
export function createOrderSubmissionDrafts(order: OrderRecord): readonly MovementDraft[] {
  return [
    {
      category: 'pedido',
      direction: 'saida',
      title: `Pedido ${order.id} emitido`,
      details: `${order.customerName} · Entrega ${order.shippingTier} (${order.region}).`,
      orderId: order.id,
      quantityDelta: -order.itemCount,
      amountCents: order.totalCents,
      source: 'manual',
    },
    {
      category: 'estoque',
      direction: 'saida',
      title: `Baixa automática · ${order.itemCount} un.`,
      details: `Itens reservados e deduzidos do catálogo para ${order.id}.`,
      orderId: order.id,
      quantityDelta: -order.itemCount,
      source: 'sistema',
    },
  ];
}

/**
 * Cria o rascunho de movimentação para ajustes de saldo no catálogo.
 *
 * @example
 * const draft = createStockMovementDraft(product, 5, 19, 'manual');
 */
export function createStockMovementDraft(
  product: ProductItem,
  delta: number,
  nextStock: number,
  source: MovementSource,
): MovementDraft {
  const direction: MovementDirection = delta > 0 ? 'entrada' : delta < 0 ? 'saida' : 'neutro';
  const verb = source === 'armazem-ao-vivo' ? 'Armazém ao vivo' : 'Ajuste manual';
  const sign = delta >= 0 ? `+${delta}` : `${delta}`;

  return {
    category: 'estoque',
    direction,
    title: `${verb} · ${product.name}`,
    details: `${product.warehouseZone} · Saldo ${sign} un. -> ${nextStock} un.`,
    sku: product.sku,
    quantityDelta: delta,
    source,
  };
}
