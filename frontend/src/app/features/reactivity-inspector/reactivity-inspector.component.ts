import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactivityEvent } from '../../core/models/order.models';

@Component({
  selector: 'app-reactivity-inspector',
  templateUrl: './reactivity-inspector.component.html',
  styleUrl: './reactivity-inspector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactivityInspectorComponent {
  public readonly events = input.required<readonly ReactivityEvent[]>();
  public readonly liveSyncEnabled = input.required<boolean>();

  protected formatTimestamp(iso: string): string {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
      return iso;
    }

    return parsed.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
