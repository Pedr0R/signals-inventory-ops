import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ORDER_TRACKING_GATEWAY } from './core/ports/order-tracking.port';
import { SimulatedOrderTrackingGateway } from './core/services/simulated-order-tracking.gateway';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: ORDER_TRACKING_GATEWAY,
      useExisting: SimulatedOrderTrackingGateway,
    },
  ],
};
