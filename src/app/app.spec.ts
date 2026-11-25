import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ORDER_TRACKING_GATEWAY } from './core/ports/order-tracking.port';
import { STORAGE_PORT } from './core/ports/storage.port';
import { FakeOrderTrackingGateway } from './testing/fake-order-tracking.gateway';
import { FakeStorageAdapter } from './testing/fake-storage.adapter';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: STORAGE_PORT, useValue: new FakeStorageAdapter() },
        { provide: ORDER_TRACKING_GATEWAY, useValue: new FakeOrderTrackingGateway() },
      ],
    }).compileComponents();
  });

  it('renderiza o shell SignalOrder e exibe o catálogo paginado', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('SignalOrder');
    expect(compiled.querySelectorAll('.product-card').length).toBeGreaterThan(0);
  });

  it('atualiza o resumo do carrinho ao adicionar um produto do catálogo', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;

    const addButtons = Array.from(compiled.querySelectorAll('.product-card button.btn-primary')).filter(
      (btn) => !(btn as HTMLButtonElement).disabled,
    );
    expect(addButtons.length).toBeGreaterThan(0);

    const initialCartLines = compiled.querySelectorAll('.cart-item').length;
    const dockCard = compiled.querySelector('[data-sku="PER-DOCK-TB4"] button.btn-primary') as HTMLButtonElement;
    dockCard.click();
    await fixture.whenStable();

    expect(compiled.querySelectorAll('.cart-item').length).toBe(initialCartLines + 1);
  });
});
