import { SystemMovement } from '../models/movement.models';
import { CartEntry, OrderRecord, ShippingRegion } from '../models/order.models';

export const STORAGE_KEY = 'signal_order_workspace_v1';

export interface PersistedOrderWorkspace {
  readonly cartEntries: readonly CartEntry[];
  readonly customerName: string;
  readonly couponInput: string;
  readonly selectedRegion: ShippingRegion;
  readonly orders: readonly OrderRecord[];
  readonly movements: readonly SystemMovement[];
}

function isValidRegion(value: unknown): value is ShippingRegion {
  return (
    value === 'sudeste' ||
    value === 'sul' ||
    value === 'nordeste' ||
    value === 'centro-oeste' ||
    value === 'norte'
  );
}

function isValidCartEntry(value: unknown): value is CartEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['productId'] === 'string' &&
    typeof candidate['quantity'] === 'number' &&
    Number.isInteger(candidate['quantity']) &&
    candidate['quantity'] > 0
  );
}

function isValidOrderRecord(value: unknown): value is OrderRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'string' &&
    typeof candidate['customerName'] === 'string' &&
    isValidRegion(candidate['region']) &&
    typeof candidate['totalCents'] === 'number' &&
    Array.isArray(candidate['items'])
  );
}

function isValidSystemMovement(value: unknown): value is SystemMovement {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'string' &&
    typeof candidate['timestampIso'] === 'string' &&
    typeof candidate['category'] === 'string' &&
    typeof candidate['direction'] === 'string' &&
    typeof candidate['title'] === 'string' &&
    typeof candidate['source'] === 'string'
  );
}

/**
 * Faz o parse seguro do estado persistido validando cada campo sem usar `any`.
 *
 * @example
 * const saved = parsePersistedWorkspace(storage.readItem(STORAGE_KEY));
 */
export function parsePersistedWorkspace(raw: string | null): Partial<PersistedOrderWorkspace> | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    return {
      cartEntries: Array.isArray(record['cartEntries'])
        ? record['cartEntries'].filter(isValidCartEntry)
        : undefined,
      customerName: typeof record['customerName'] === 'string' ? record['customerName'] : undefined,
      couponInput: typeof record['couponInput'] === 'string' ? record['couponInput'] : undefined,
      selectedRegion: isValidRegion(record['selectedRegion']) ? record['selectedRegion'] : undefined,
      orders: Array.isArray(record['orders']) ? record['orders'].filter(isValidOrderRecord) : undefined,
      movements: Array.isArray(record['movements'])
        ? record['movements'].filter(isValidSystemMovement)
        : undefined,
    };
  } catch {
    return null;
  }
}
