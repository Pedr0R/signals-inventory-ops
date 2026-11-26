import { Routes } from '@angular/router';
import { MovementHistoryComponent } from './features/movement-history/movement-history.component';
import { OperationsDashboardComponent } from './features/operations-dashboard/operations-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: OperationsDashboardComponent,
    title: 'SignalOrder — Operação',
  },
  {
    path: 'historico',
    component: MovementHistoryComponent,
    title: 'SignalOrder — Histórico de Movimentações',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
