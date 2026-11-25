import { Injectable } from '@angular/core';
import { OrderRecord, OrderTrackingDetails, TrackingEvent } from '../models/order.models';
import { OrderTrackingGateway, TrackingRequestOptions } from '../ports/order-tracking.port';

const SIMULATED_LATENCY_MS = 550;

function createAbortError(): DOMException {
  return new DOMException('Consulta de rastreamento cancelada pelo AbortSignal.', 'AbortError');
}

function buildTrackingEvents(order: OrderRecord): readonly TrackingEvent[] {
  const createdMs = Date.parse(order.createdAtIso);
  const baseMs = Number.isNaN(createdMs) ? Date.now() : createdMs;

  return [
    {
      timestampIso: new Date(baseMs).toISOString(),
      location: 'Centro de Distribuição SP',
      description: `Pedido ${order.id} confirmado (${order.itemCount} item(ns)).`,
    },
    {
      timestampIso: new Date(baseMs + 25 * 60_000).toISOString(),
      location: 'Docas de Expedição',
      description: `Separação concluída para modalidade ${order.shippingTier}.`,
    },
    {
      timestampIso: new Date(baseMs + 90 * 60_000).toISOString(),
      location: `Hub Regional (${order.region.toUpperCase()})`,
      description: 'Em trânsito para o destinatário final.',
    },
  ];
}

function resolveEstimatedDelivery(order: OrderRecord): string {
  if (order.shippingTier === 'same-day') {
    return 'Hoje até 18h00';
  }

  if (order.shippingTier === 'express') {
    return 'Próximo dia útil até 14h00';
  }

  return 'Em até 4 dias úteis';
}

/**
 * Gateway simulado de rastreamento com suporte a latência assíncrona,
 * cancelamento via `AbortSignal` e falha controlada para testar `resource.reload()`.
 */
@Injectable({ providedIn: 'root' })
export class SimulatedOrderTrackingGateway implements OrderTrackingGateway {
  /**
   * Busca os eventos de rastreamento de um pedido de forma assíncrona.
   *
   * @example
   * const details = await gateway.fetchTrackingDetails({ order, abortSignal, simulateFailure: false });
   */
  public fetchTrackingDetails(options: TrackingRequestOptions): Promise<OrderTrackingDetails> {
    if (options.abortSignal.aborted) {
      return Promise.reject(createAbortError());
    }

    return new Promise<OrderTrackingDetails>((resolve, reject) => {
      const onAbort = (): void => {
        clearTimeout(timerId);
        reject(createAbortError());
      };

      const timerId = setTimeout(() => {
        options.abortSignal.removeEventListener('abort', onAbort);
        if (options.simulateFailure) {
          reject(
            new Error(
              `Falha ao consultar rastreamento do pedido "${options.order.id}". Esperado status 200 OK do serviço logístico.`,
            ),
          );
          return;
        }

        resolve(this.createDetailsPayload(options.order));
      }, SIMULATED_LATENCY_MS);

      options.abortSignal.addEventListener('abort', onAbort, { once: true });
    });
  }

  private createDetailsPayload(order: OrderRecord): OrderTrackingDetails {
    return {
      orderId: order.id,
      carrier: order.shippingTier === 'same-day' ? 'SignalExpress Motofrete' : 'VeloLog Corporativa',
      trackingCode: `BR-${order.id.replace('PED-', '')}-SG`,
      currentStage: 'transporte',
      estimatedDelivery: resolveEstimatedDelivery(order),
      events: buildTrackingEvents(order),
      fetchedAtIso: new Date().toISOString(),
    };
  }
}
