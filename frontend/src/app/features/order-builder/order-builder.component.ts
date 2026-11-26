import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { formatBrlFromCents } from '../../core/domain/currency-formatter';
import {
  CartLineSummary,
  CouponCode,
  PricingBreakdown,
  ShippingOption,
  ShippingRegion,
  ShippingTier,
} from '../../core/models/order.models';
import { QuantityStepperComponent } from '../../shared/quantity-stepper/quantity-stepper.component';

export interface CartQuantityChangeEvent {
  readonly productId: string;
  readonly quantity: number;
}

@Component({
  selector: 'app-order-builder',
  imports: [QuantityStepperComponent],
  templateUrl: './order-builder.component.html',
  styleUrl: './order-builder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderBuilderComponent {
  public readonly lines = input.required<readonly CartLineSummary[]>();
  public readonly pricing = input.required<PricingBreakdown>();
  public readonly hasConflicts = input.required<boolean>();
  public readonly canSubmit = input.required<boolean>();
  public readonly shippingOptions = input.required<readonly ShippingOption[]>();

  public readonly customerName = model.required<string>();
  public readonly couponInput = model.required<string>();
  public readonly selectedRegion = model.required<ShippingRegion>();
  public readonly selectedShippingTier = model.required<ShippingTier>();

  public readonly quantityChange = output<CartQuantityChangeEvent>();
  public readonly removeItem = output<string>();
  public readonly clearCart = output<void>();
  public readonly submitOrder = output<void>();

  protected readonly quickCoupons: readonly CouponCode[] = [
    'SIGNALS10',
    'VIP20',
    'FRETEGRATIS',
  ];

  protected formatPrice(cents: number): string {
    return formatBrlFromCents(cents);
  }

  protected onCustomerInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.customerName.set(target.value);
  }

  protected onCouponInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.couponInput.set(target.value);
  }

  protected onRegionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedRegion.set(target.value as ShippingRegion);
  }

  protected maxSelectable(availableQuantity: number): number {
    return Math.max(1, availableQuantity);
  }

  protected onLineQuantityChange(productId: string, quantity: number): void {
    this.quantityChange.emit({ productId, quantity });
  }
}
