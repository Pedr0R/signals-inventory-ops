import { InjectionToken } from '@angular/core';
import { OrderRecord, OrderTrackingDetails } from '../models/order.models';

export interface TrackingRequestOptions {
  readonly order: OrderRecord;
  readonly abortSignal: AbortSignal;
  readonly simulateFailure: boolean;
}

export interface OrderTrackingGateway {
  fetchTrackingDetails(options: TrackingRequestOptions): Promise<OrderTrackingDetails>;
}

export const ORDER_TRACKING_GATEWAY = new InjectionToken<OrderTrackingGateway>(
  'ORDER_TRACKING_GATEWAY',
);
