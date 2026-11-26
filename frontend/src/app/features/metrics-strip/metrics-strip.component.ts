import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatBrlFromCents } from '../../core/domain/currency-formatter';
import { InventoryMetrics } from '../../core/models/inventory.models';

@Component({
  selector: 'app-metrics-strip',
  templateUrl: './metrics-strip.component.html',
  styleUrl: './metrics-strip.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsStripComponent {
  public readonly metrics = input.required<InventoryMetrics>();
  public readonly cartCount = input.required<number>();
  public readonly totalRevenueCents = input.required<number>();
  public readonly hasConflicts = input.required<boolean>();

  protected readonly formattedValuation = computed<string>(() =>
    formatBrlFromCents(this.metrics().totalValuationCents),
  );

  protected readonly formattedRevenue = computed<string>(() =>
    formatBrlFromCents(this.totalRevenueCents()),
  );
}
