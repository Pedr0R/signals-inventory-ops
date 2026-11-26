import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { ORDER_TRACKING_GATEWAY } from './core/ports/order-tracking.port';
import { STORAGE_PORT } from './core/ports/storage.port';
import { FakeOrderTrackingGateway } from './testing/fake-order-tracking.gateway';
import { FakeStorageAdapter } from './testing/fake-storage.adapter';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        { provide: STORAGE_PORT, useValue: new FakeStorageAdapter() },
        { provide: ORDER_TRACKING_GATEWAY, useValue: new FakeOrderTrackingGateway() },
      ],
    }).compileComponents();
  });

  it('renderiza o shell SignalOrder e exibe o catálogo paginado na rota inicial', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('SignalOrder');
    expect(compiled.querySelectorAll('.product-card').length).toBeGreaterThan(0);
  });

  it('atualiza o resumo do carrinho ao adicionar um produto do catálogo', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const initialCartLines = compiled.querySelectorAll('.cart-item').length;
    const dockCard = compiled.querySelector('[data-sku="PER-DOCK-TB4"] button.btn-primary') as HTMLButtonElement;
    dockCard.click();
    await fixture.whenStable();

    expect(compiled.querySelectorAll('.cart-item').length).toBe(initialCartLines + 1);
  });

  it('navega para a tela /historico e exibe as movimentações do sistema', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    await router.navigateByUrl('/historico');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h2')?.textContent).toContain('Histórico de Movimentações');
    expect(compiled.querySelectorAll('.history-table tbody tr').length).toBeGreaterThan(0);
  });
});
