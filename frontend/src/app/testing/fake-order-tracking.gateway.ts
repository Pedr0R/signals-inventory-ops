import { OrderTrackingDetails } from '../core/models/order.models';
import { OrderTrackingGateway, TrackingRequestOptions } from '../core/ports/order-tracking.port';

/**
 * Gateway falso para testar `resource()`, cancelamentos e recuperação de erros
 * sem depender de temporizadores reais.
 */
export class FakeOrderTrackingGateway implements OrderTrackingGateway {
  public readonly requestedOrderIds: string[] = [];
  public abortedCount = 0;

  /**
   * Retorna imediatamente os detalhes de rastreamento ou rejeita quando `simulateFailure` é verdadeiro.
   *
   * @example
   * const details = await fakeGateway.fetchTrackingDetails(options);
   */
  public async fetchTrackingDetails(options: TrackingRequestOptions): Promise<OrderTrackingDetails> {
    this.requestedOrderIds.push(options.order.id);
    options.abortSignal.addEventListener('abort', () => {
      this.abortedCount += 1;
    });

    if (options.simulateFailure) {
      throw new Error(`Erro simulado ao rastrear "${options.order.id}". Esperado 200 OK.`);
    }

    return {
      orderId: options.order.id,
      carrier: 'Transportadora Teste',
      trackingCode: `TEST-${options.order.id}`,
      currentStage: 'separacao',
      estimatedDelivery: 'Amanhã até 12h00',
      events: [
        {
          timestampIso: options.order.createdAtIso,
          location: 'Hub Teste',
          description: `Pedido ${options.order.id} recebido.`,
        },
      ],
      fetchedAtIso: '2026-11-24T16:00:00.000Z',
    };
  }
}
