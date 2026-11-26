import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  templateUrl: './quantity-stepper.component.html',
  styleUrl: './quantity-stepper.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantityStepperComponent {
  public readonly value = model.required<number>();
  public readonly min = input<number>(1);
  public readonly max = input.required<number>();
  public readonly disabled = input<boolean>(false);

  protected readonly canDecrement = computed<boolean>(
    () => !this.disabled() && this.value() > this.min(),
  );

  protected readonly canIncrement = computed<boolean>(
    () => !this.disabled() && this.value() < this.max(),
  );

  /**
   * Diminui a quantidade respeitando o limite mínimo configurado.
   *
   * @example
   * stepper.decrement();
   */
  protected decrement(): void {
    if (!this.canDecrement()) {
      return;
    }

    this.value.update((current) => Math.max(this.min(), current - 1));
  }

  /**
   * Aumenta a quantidade respeitando o teto de estoque disponível.
   *
   * @example
   * stepper.increment();
   */
  protected increment(): void {
    if (!this.canIncrement()) {
      return;
    }

    this.value.update((current) => Math.min(this.max(), current + 1));
  }
}
