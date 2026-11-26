import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { OrderTrackingDetails } from '../../core/models/order.models';
import { InventoryOrderStore } from '../../core/state/inventory-order.store';
import { CatalogToolbarComponent } from '../catalog-toolbar/catalog-toolbar.component';
import { MetricsStripComponent } from '../metrics-strip/metrics-strip.component';
import {
  CartQuantityChangeEvent,
  OrderBuilderComponent,
} from '../order-builder/order-builder.component';
import { OrderTrackerComponent } from '../order-tracker/order-tracker.component';
import {
  ProductCatalogComponent,
  StockAdjustmentEvent,
} from '../product-catalog/product-catalog.component';
import { ReactivityInspectorComponent } from '../reactivity-inspector/reactivity-inspector.component';

@Component({
  selector: 'app-operations-dashboard',
  imports: [
    MetricsStripComponent,
    CatalogToolbarComponent,
    ProductCatalogComponent,
    OrderBuilderComponent,
    OrderTrackerComponent,
    ReactivityInspectorComponent,
  ],
  templateUrl: './operations-dashboard.component.html',
  styleUrl: './operations-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsDashboardComponent {
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
