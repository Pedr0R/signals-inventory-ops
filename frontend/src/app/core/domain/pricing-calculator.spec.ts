import { INITIAL_CATALOG } from './catalog-seed';
import {
  buildCartLineSummaries,
  calculatePricingBreakdown,
  getShippingOptionsForRegion,
  validateCouponCode,
} from './pricing-calculator';

describe('pricing-calculator', () => {
  it('sinaliza conflito quando a quantidade solicitada supera o estoque disponível', () => {
    const nasProduct = INITIAL_CATALOG.find((item) => item.id === 'prod-nas-4bay')!;
    const lines = buildCartLineSummaries([{ productId: nasProduct.id, quantity: 5 }], INITIAL_CATALOG);

    expect(lines.length).toBe(1);
    expect(lines[0].hasStockConflict).toBe(true);
    expect(lines[0].availableQuantity).toBe(nasProduct.stockQuantity);
  });

  it('aplica desconto de volume, cupom SIGNALS10, frete grátis regional e imposto de 8%', () => {
    const switchProd = INITIAL_CATALOG.find((item) => item.id === 'prod-switch-24p')!;
    const lines = buildCartLineSummaries([{ productId: switchProd.id, quantity: 1 }], INITIAL_CATALOG);

    const pricing = calculatePricingBreakdown(lines, 'sudeste', 'standard', 'SIGNALS10');

    expect(pricing.subtotalCents).toBe(389000);
    expect(pricing.volumeDiscountCents).toBe(19450);
    expect(pricing.couponDiscountCents).toBe(38900);
    expect(pricing.qualifiesForFreeShipping).toBe(true);
    expect(pricing.shippingFeeCents).toBe(0);
    expect(pricing.taxCents).toBe(Math.round((389000 - 19450 - 38900) * 0.08));
  });

  it('retorna mensagem clara contendo valor inválido para cupom desconhecido', () => {
    const result = validateCouponCode('DESC50');

    expect(result.validCode).toBeNull();
    expect(result.error).toContain('DESC50');
    expect(result.error).toContain('SIGNALS10');
  });

  it('oferece entrega no mesmo dia apenas para Sudeste e Sul', () => {
    const sudesteTiers = getShippingOptionsForRegion('sudeste').map((opt) => opt.tier);
    const norteTiers = getShippingOptionsForRegion('norte').map((opt) => opt.tier);

    expect(sudesteTiers).toContain('same-day');
    expect(norteTiers).not.toContain('same-day');
  });
});
