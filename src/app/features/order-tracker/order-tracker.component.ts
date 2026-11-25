import { ChangeDetectionStrategy, Component, input, output, ResourceStatus } from '@angular/core';
import { formatBrlFromCents } from '../../core/domain/currency-formatter';
import { OrderRecord, OrderTrackingDetails } from '../../core/models/order.models';

@Component({
  selector: 'app-order-tracker',
  templateUrl: './order-tracker.component.html',
  styleUrl: './order-tracker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTrackerComponent {
  public readonly orders = input.required<readonly OrderRecord[]>();
  public readonly selectedOrderId = input.required<string | null>();
  public readonly resourceStatus = input.required<ResourceStatus>();
  public readonly isLoading = input.required<boolean>();
  public readonly errorMessage = input.required<string | null>();
  public readonly trackingDetails = input.required<OrderTrackingDetails | null>();
  public readonly simulateFailure = input.required<boolean>();

  public readonly selectOrder = output<string>();
  public readonly reloadTracking = output<void>();
  public readonly toggleFailure = output<void>();

  protected formatPrice(cents: number): string {
    return formatBrlFromCents(cents);
  }

  protected formatTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }

    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
