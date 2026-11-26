import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { resolveStockStatus } from '../../core/domain/catalog-filter';
import { formatBrlFromCents } from '../../core/domain/currency-formatter';
import { ProductItem, StockStatus } from '../../core/models/inventory.models';

export interface StockAdjustmentEvent {
  readonly productId: string;
  readonly delta: number;
}

@Component({
  selector: 'app-product-catalog',
  templateUrl: './product-catalog.component.html',
  styleUrl: './product-catalog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCatalogComponent {
  public readonly products = input.required<readonly ProductItem[]>();
  public readonly totalMatches = input.required<number>();
  public readonly currentPage = input.required<number>();
  public readonly totalPages = input.required<number>();
  public readonly cartQuantities = input.required<ReadonlyMap<string, number>>();

  public readonly addToCart = output<string>();
  public readonly adjustStock = output<StockAdjustmentEvent>();
  public readonly pageChange = output<number>();

  protected formatPrice(cents: number): string {
    return formatBrlFromCents(cents);
  }

  protected statusOf(item: ProductItem): StockStatus {
    return resolveStockStatus(item);
  }

  protected statusLabel(item: ProductItem): string {
    const status = resolveStockStatus(item);
    if (status === 'out-of-stock') {
      return 'Esgotado';
    }

    if (status === 'low-stock') {
      return 'Estoque baixo';
    }

    return 'Em estoque';
  }

  protected quantityInCart(productId: string): number {
    return this.cartQuantities().get(productId) ?? 0;
  }

  protected canAddMore(item: ProductItem): boolean {
    return item.stockQuantity > 0 && this.quantityInCart(item.id) < item.stockQuantity;
  }
}
