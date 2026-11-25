import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  model,
  output,
  viewChild,
} from '@angular/core';
import {
  CatalogSortField,
  ProductCategory,
  StockStatus,
} from '../../core/models/inventory.models';

@Component({
  selector: 'app-catalog-toolbar',
  templateUrl: './catalog-toolbar.component.html',
  styleUrl: './catalog-toolbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogToolbarComponent {
  public readonly searchQuery = model.required<string>();
  public readonly category = model.required<ProductCategory | 'all'>();
  public readonly stockStatus = model.required<StockStatus | 'all'>();
  public readonly sortBy = model.required<CatalogSortField>();
  public readonly clearRequested = output<void>();

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /**
   * Foca o campo de busca usando `viewChild` baseado em signal.
   *
   * @example
   * toolbar.focusSearch();
   */
  public focusSearch(): void {
    this.searchInput()?.nativeElement.focus();
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  protected onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.category.set(target.value as ProductCategory | 'all');
  }

  protected onStockChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.stockStatus.set(target.value as StockStatus | 'all');
  }

  protected onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy.set(target.value as CatalogSortField);
  }
}
