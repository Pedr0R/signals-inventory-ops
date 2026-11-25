import { ProductItem } from '../models/inventory.models';
import {
  CartEntry,
  CartLineSummary,
  CouponCode,
  PricingBreakdown,
  ShippingOption,
  ShippingRegion,
  ShippingTier,
} from '../models/order.models';

const VOLUME_DISCOUNT_THRESHOLD_CENTS = 250000;
const VOLUME_DISCOUNT_RATE = 0.05;
const VIP_COUPON_THRESHOLD_CENTS = 400000;
const TAX_RATE = 0.08;

const SHIPPING_CATALOG: Record<ShippingRegion, readonly ShippingOption[]> = {
  sudeste: [
    { tier: 'standard', label: 'Entrega Padrão', estimatedDays: '2–3 dias úteis', feeCents: 2900, freeShippingThresholdCents: 200000 },
    { tier: 'express', label: 'Expresso Aéreo', estimatedDays: '1 dia útil', feeCents: 5900, freeShippingThresholdCents: 450000 },
    { tier: 'same-day', label: 'Motofrete Hoje', estimatedDays: 'Mesmo dia (até 18h)', feeCents: 8900, freeShippingThresholdCents: null },
  ],
  sul: [
    { tier: 'standard', label: 'Entrega Padrão', estimatedDays: '3–4 dias úteis', feeCents: 3900, freeShippingThresholdCents: 250000 },
    { tier: 'express', label: 'Expresso Aéreo', estimatedDays: '1–2 dias úteis', feeCents: 6900, freeShippingThresholdCents: 500000 },
    { tier: 'same-day', label: 'Hub Curitiba/POA', estimatedDays: 'Mesmo dia (capitais)', feeCents: 9900, freeShippingThresholdCents: null },
  ],
  'centro-oeste': [
    { tier: 'standard', label: 'Entrega Padrão', estimatedDays: '4–5 dias úteis', feeCents: 4900, freeShippingThresholdCents: 300000 },
    { tier: 'express', label: 'Expresso Aéreo', estimatedDays: '2 dias úteis', feeCents: 8500, freeShippingThresholdCents: null },
  ],
  nordeste: [
    { tier: 'standard', label: 'Entrega Padrão', estimatedDays: '5–7 dias úteis', feeCents: 5900, freeShippingThresholdCents: 350000 },
    { tier: 'express', label: 'Expresso Aéreo', estimatedDays: '2–3 dias úteis', feeCents: 9900, freeShippingThresholdCents: null },
  ],
  norte: [
    { tier: 'standard', label: 'Entrega Padrão', estimatedDays: '7–10 dias úteis', feeCents: 7900, freeShippingThresholdCents: 450000 },
    { tier: 'express', label: 'Expresso Aéreo', estimatedDays: '3–4 dias úteis', feeCents: 12900, freeShippingThresholdCents: null },
  ],
};

export interface CouponValidationResult {
  readonly validCode: CouponCode | null;
  readonly error: string | null;
}

/**
 * Retorna as modalidades de frete suportadas para a região de entrega selecionada.
 *
 * @example
 * const options = getShippingOptionsForRegion('sudeste');
 */
export function getShippingOptionsForRegion(region: ShippingRegion): readonly ShippingOption[] {
  return SHIPPING_CATALOG[region];
}

/**
 * Valida o código de cupom informado pelo usuário.
 *
 * @example
 * const result = validateCouponCode('SIGNALS10');
 */
export function validateCouponCode(rawCode: string): CouponValidationResult {
  const normalized = rawCode.trim().toUpperCase();
  if (!normalized) {
    return { validCode: null, error: null };
  }

  if (normalized === 'SIGNALS10' || normalized === 'VIP20' || normalized === 'FRETEGRATIS') {
    return { validCode: normalized, error: null };
  }

  return {
    validCode: null,
    error: `Cupom "${rawCode}" inválido. Use SIGNALS10, VIP20 ou FRETEGRATIS.`,
  };
}

/**
 * Combina as entradas do carrinho com o catálogo atualizado e sinaliza conflitos de estoque.
 *
 * @example
 * const lines = buildCartLineSummaries(entries, catalog);
 */
export function buildCartLineSummaries(
  entries: readonly CartEntry[],
  catalog: readonly ProductItem[],
): readonly CartLineSummary[] {
  const catalogById = new Map<string, ProductItem>(catalog.map((item) => [item.id, item]));
  const summaries: CartLineSummary[] = [];

  for (const entry of entries) {
    const product = catalogById.get(entry.productId);
    if (!product) {
      continue;
    }

    summaries.push({
      product,
      requestedQuantity: entry.quantity,
      availableQuantity: product.stockQuantity,
      lineSubtotalCents: product.unitPriceCents * entry.quantity,
      hasStockConflict: entry.quantity > product.stockQuantity || product.stockQuantity <= 0,
    });
  }

  return summaries;
}

function resolveCouponDiscount(
  coupon: CouponCode | null,
  subtotalCents: number,
): { discountCents: number; error: string | null } {
  if (!coupon || subtotalCents <= 0) {
    return { discountCents: 0, error: null };
  }

  if (coupon === 'SIGNALS10') {
    return { discountCents: Math.round(subtotalCents * 0.1), error: null };
  }

  if (coupon === 'VIP20') {
    if (subtotalCents < VIP_COUPON_THRESHOLD_CENTS) {
      return {
        discountCents: 0,
        error: `Cupom "VIP20" exige subtotal mínimo de R$ 4.000,00.`,
      };
    }

    return { discountCents: Math.round(subtotalCents * 0.2), error: null };
  }

  return { discountCents: 0, error: null };
}

function resolveShippingFee(
  region: ShippingRegion,
  tier: ShippingTier,
  subtotalCents: number,
  appliedCoupon: CouponCode | null,
): { feeCents: number; freeShipping: boolean } {
  if (subtotalCents <= 0) {
    return { feeCents: 0, freeShipping: false };
  }

  const options = getShippingOptionsForRegion(region);
  const selected = options.find((opt) => opt.tier === tier) ?? options[0];
  const reachedThreshold =
    selected.freeShippingThresholdCents !== null &&
    subtotalCents >= selected.freeShippingThresholdCents;

  if (appliedCoupon === 'FRETEGRATIS' || reachedThreshold) {
    return { feeCents: 0, freeShipping: true };
  }

  return { feeCents: selected.feeCents, freeShipping: false };
}

/**
 * Calcula o detalhamento financeiro completo do pedido (descontos, frete e impostos).
 *
 * @example
 * const breakdown = calculatePricingBreakdown(lines, 'sudeste', 'standard', 'SIGNALS10');
 */
export function calculatePricingBreakdown(
  lines: readonly CartLineSummary[],
  region: ShippingRegion,
  tier: ShippingTier,
  rawCoupon: string,
): PricingBreakdown {
  const subtotalCents = lines.reduce((sum, line) => sum + line.lineSubtotalCents, 0);
  const volumeDiscountCents =
    subtotalCents >= VOLUME_DISCOUNT_THRESHOLD_CENTS
      ? Math.round(subtotalCents * VOLUME_DISCOUNT_RATE)
      : 0;

  const validation = validateCouponCode(rawCoupon);
  const couponOutcome = resolveCouponDiscount(validation.validCode, subtotalCents);
  const appliedCoupon = couponOutcome.error ? null : validation.validCode;
  const shipping = resolveShippingFee(region, tier, subtotalCents, appliedCoupon);
  const taxableCents = Math.max(0, subtotalCents - volumeDiscountCents - couponOutcome.discountCents);
  const taxCents = Math.round(taxableCents * TAX_RATE);

  return {
    subtotalCents,
    volumeDiscountCents,
    couponDiscountCents: couponOutcome.discountCents,
    shippingFeeCents: shipping.feeCents,
    taxCents,
    grandTotalCents: taxableCents + shipping.feeCents + taxCents,
    appliedCoupon,
    couponError: validation.error ?? couponOutcome.error,
    qualifiesForFreeShipping: shipping.freeShipping,
  };
}
