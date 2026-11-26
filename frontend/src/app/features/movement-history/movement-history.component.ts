import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { paginateItems } from '../../core/domain/catalog-filter';
import { formatBrlFromCents } from '../../core/domain/currency-formatter';
import { computeMovementMetrics, filterMovements } from '../../core/domain/movement-filter';
import {
  MovementCategory,
  MovementDirection,
  MovementFilterState,
  MovementSource,
  MovementSummaryMetrics,
  SystemMovement,
} from '../../core/models/movement.models';
import { InventoryOrderStore } from '../../core/state/inventory-order.store';

const HISTORY_PAGE_SIZE = 8;

@Component({
  selector: 'app-movement-history',
  templateUrl: './movement-history.component.html',
  styleUrl: './movement-history.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementHistoryComponent {
  protected readonly store = inject(InventoryOrderStore);

  protected readonly searchQuery = signal<string>('');
  protected readonly categoryFilter = signal<MovementCategory | 'all'>('all');
  protected readonly directionFilter = signal<MovementDirection | 'all'>('all');
  protected readonly sourceFilter = signal<MovementSource | 'all'>('all');

  protected readonly filterState = computed<MovementFilterState>(() => ({
    searchQuery: this.searchQuery(),
    category: this.categoryFilter(),
    direction: this.directionFilter(),
    source: this.sourceFilter(),
  }));

  protected readonly filteredMovements = computed<readonly SystemMovement[]>(() =>
    filterMovements(this.store.movements(), this.filterState()),
  );

  protected readonly metrics = computed<MovementSummaryMetrics>(() =>
    computeMovementMetrics(this.filteredMovements()),
  );

  protected readonly totalPages = computed<number>(() =>
    Math.max(1, Math.ceil(this.filteredMovements().length / HISTORY_PAGE_SIZE)),
  );

  protected readonly currentPage = linkedSignal<MovementFilterState, number>({
    source: this.filterState,
    computation: () => 1,
  });

  protected readonly paginatedMovements = computed<readonly SystemMovement[]>(() =>
    paginateItems(this.filteredMovements(), this.currentPage(), HISTORY_PAGE_SIZE),
  );

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  protected onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.categoryFilter.set(target.value as MovementCategory | 'all');
  }

  protected onDirectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.directionFilter.set(target.value as MovementDirection | 'all');
  }

  protected onSourceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sourceFilter.set(target.value as MovementSource | 'all');
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.categoryFilter.set('all');
    this.directionFilter.set('all');
    this.sourceFilter.set('all');
  }

  protected setPage(page: number): void {
    if (!Number.isInteger(page) || page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  protected clearHistory(): void {
    this.store.clearMovements();
  }

  protected formatDateTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  protected formatPrice(cents: number | null): string {
    if (cents === null) {
      return '—';
    }

    return formatBrlFromCents(cents);
  }

  protected formatDelta(delta: number | null): string {
    if (delta === null) {
      return '—';
    }

    return delta > 0 ? `+${delta} un.` : `${delta} un.`;
  }

  protected categoryLabel(category: MovementCategory): string {
    switch (category) {
      case 'estoque':
        return 'Estoque';
      case 'carrinho':
        return 'Carrinho';
      case 'pedido':
        return 'Pedido';
      case 'logistica':
        return 'Logística';
      case 'sistema':
        return 'Sistema';
    }
  }

  protected directionLabel(direction: MovementDirection): string {
    if (direction === 'entrada') {
      return 'Entrada';
    }

    if (direction === 'saida') {
      return 'Saída';
    }

    return 'Neutro';
  }

  protected sourceLabel(source: MovementSource): string {
    if (source === 'armazem-ao-vivo') {
      return 'Armazém ao vivo';
    }

    return source === 'sistema' ? 'Sistema' : 'Manual';
  }
}
