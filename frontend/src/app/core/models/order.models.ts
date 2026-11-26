import { ProductItem } from './inventory.models';

export type ShippingRegion = 'sudeste' | 'sul' | 'nordeste' | 'centro-oeste' | 'norte';

export type ShippingTier = 'standard' | 'express' | 'same-day';

export type CouponCode = 'SIGNALS10' | 'VIP20' | 'FRETEGRATIS';

export type TrackingStage = 'confirmado' | 'separacao' | 'transporte' | 'entregue';

export type SignalPrimitiveKind = 'signal' | 'computed' | 'linkedSignal' | 'resource' | 'effect';

export interface ShippingOption {
  readonly tier: ShippingTier;
  readonly label: string;
  readonly estimatedDays: string;
  readonly feeCents: number;
  readonly freeShippingThresholdCents: number | null;
}

export interface CartEntry {
  readonly productId: string;
  readonly quantity: number;
}

export interface CartLineSummary {
  readonly product: ProductItem;
  readonly requestedQuantity: number;
  readonly availableQuantity: number;
  readonly lineSubtotalCents: number;
  readonly hasStockConflict: boolean;
}

export interface PricingBreakdown {
  readonly subtotalCents: number;
  readonly volumeDiscountCents: number;
  readonly couponDiscountCents: number;
  readonly shippingFeeCents: number;
  readonly taxCents: number;
  readonly grandTotalCents: number;
  readonly appliedCoupon: CouponCode | null;
  readonly couponError: string | null;
  readonly qualifiesForFreeShipping: boolean;
}

export interface OrderLineSnapshot {
  readonly productId: string;
  readonly productName: string;
  readonly sku: string;
  readonly quantity: number;
  readonly unitPriceCents: number;
}

export interface OrderRecord {
  readonly id: string;
  readonly customerName: string;
  readonly region: ShippingRegion;
  readonly shippingTier: ShippingTier;
  readonly createdAtIso: string;
  readonly totalCents: number;
  readonly itemCount: number;
  readonly items: readonly OrderLineSnapshot[];
}

export interface TrackingEvent {
  readonly timestampIso: string;
  readonly location: string;
  readonly description: string;
}

export interface OrderTrackingDetails {
  readonly orderId: string;
  readonly carrier: string;
  readonly trackingCode: string;
  readonly currentStage: TrackingStage;
  readonly estimatedDelivery: string;
  readonly events: readonly TrackingEvent[];
  readonly fetchedAtIso: string;
}

export interface ReactivityEvent {
  readonly id: string;
  readonly timestampIso: string;
  readonly primitive: SignalPrimitiveKind;
  readonly summary: string;
}
