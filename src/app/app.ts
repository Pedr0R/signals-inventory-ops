import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { OrderTrackingDetails } from './core/models/order.models';
import { InventoryOrderStore } from './core/state/inventory-order.store';
import { CatalogToolbarComponent } from './features/catalog-toolbar/catalog-toolbar.component';
import { MetricsStripComponent } from './features/metrics-strip/metrics-strip.component';
import {
  CartQuantityChangeEvent,
  OrderBuilderComponent,
} from './features/order-builder/order-builder.component';
import { OrderTrackerComponent } from './features/order-tracker/order-tracker.component';
import {
  ProductCatalogComponent,
  StockAdjustmentEvent,
} from './features/product-catalog/product-catalog.component';
import { ReactivityInspectorComponent } from './features/reactivity-inspector/reactivity-inspector.component';

@Component({
  selector: 'app-root',
  imports: [
    MetricsStripComponent,
    CatalogToolbarComponent,
    ProductCatalogComponent,
    OrderBuilderComponent,
    OrderTrackerComponent,
    ReactivityInspectorComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly store = inject(InventoryOrderStore);

  protected readonly trackingDetails = computed<OrderTrackingDetails | null>(() => {
    const resourceRef = this.store.orderTrackingResource;
    return resourceRef.hasValue() ? (resourceRef.value() ?? null) : null;
  });

  protected readonly trackingErrorMessage = computed<string | null>(() => {
    const err = this.store.orderTrackingResource.error();
    return err ? err.message : null;
  });

  protected onAdjustStock(event: StockAdjustmentEvent): void {
    this.store.adjustProductStock(event.productId, event.delta);
  }

  protected onCartQuantityChange(event: CartQuantityChangeEvent): void {
    this.store.updateCartQuantity(event.productId, event.quantity);
  }

  protected onSubmitOrder(): void {
    this.store.submitOrder();
  }
}
