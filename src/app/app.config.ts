import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { ORDER_TRACKING_GATEWAY } from './core/ports/order-tracking.port';
import { SimulatedOrderTrackingGateway } from './core/services/simulated-order-tracking.gateway';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: ORDER_TRACKING_GATEWAY,
      useExisting: SimulatedOrderTrackingGateway,
    },
  ],
};
