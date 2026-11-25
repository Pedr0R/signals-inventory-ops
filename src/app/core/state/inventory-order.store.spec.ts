import { TestBed } from '@angular/core/testing';
import { ORDER_TRACKING_GATEWAY } from '../ports/order-tracking.port';
import { STORAGE_PORT } from '../ports/storage.port';
import { FakeOrderTrackingGateway } from '../../testing/fake-order-tracking.gateway';
import { FakeStorageAdapter } from '../../testing/fake-storage.adapter';
import { InventoryOrderStore } from './inventory-order.store';
import { STORAGE_KEY } from './store-persistence';

describe('InventoryOrderStore', () => {
  let store: InventoryOrderStore;
  let fakeStorage: FakeStorageAdapter;
  let fakeGateway: FakeOrderTrackingGateway;

  beforeEach(() => {
    fakeStorage = new FakeStorageAdapter();
    fakeGateway = new FakeOrderTrackingGateway();

    TestBed.configureTestingModule({
      providers: [
        InventoryOrderStore,
        { provide: STORAGE_PORT, useValue: fakeStorage },
        { provide: ORDER_TRACKING_GATEWAY, useValue: fakeGateway },
      ],
    });

    store = TestBed.inject(InventoryOrderStore);
    TestBed.tick();
  });

  it('reseta currentPage para 1 via linkedSignal ao alterar filtros do catálogo', () => {
    store.setPage(2);
    expect(store.currentPage()).toBe(2);

    store.setSearchQuery('NVMe');

    expect(store.currentPage()).toBe(1);
  });

  it('preserva same-day ao trocar Sudeste -> Sul e faz fallback para standard em Norte', () => {
    store.setRegion('sudeste');
    store.setShippingTier('same-day');
    expect(store.selectedShippingTier()).toBe('same-day');

    store.setRegion('sul');
    expect(store.selectedShippingTier()).toBe('same-day');

    store.setRegion('norte');
    expect(store.selectedShippingTier()).toBe('standard');
  });

  it('detecta conflito de estoque no carrinho quando o saldo cai abaixo do solicitado', () => {
    store.clearCart();
    store.addToCart('prod-ram-64gb', 3);
    expect(store.hasStockConflicts()).toBe(false);

    store.adjustProductStock('prod-ram-64gb', -2);

    expect(store.hasStockConflicts()).toBe(true);
    expect(store.canSubmitOrder()).toBe(false);

    store.adjustProductStock('prod-ram-64gb', 2);
    expect(store.hasStockConflicts()).toBe(false);
    expect(store.canSubmitOrder()).toBe(true);
  });

  it('persiste alterações reativamente via effect no StoragePort', () => {
    const writesBefore = fakeStorage.writeCount;

    store.setCustomerName('Plataforma Signals Ltda');
    TestBed.tick();

    expect(fakeStorage.writeCount).toBeGreaterThan(writesBefore);
    const saved = fakeStorage.readItem(STORAGE_KEY);
    expect(saved).toContain('Plataforma Signals Ltda');
  });

  it('emite pedido, deduz estoque e carrega rastreamento via resource()', async () => {
    store.clearCart();
    store.addToCart('prod-nvme-2tb', 2);
    const initialStock = store.catalog().find((p) => p.id === 'prod-nvme-2tb')!.stockQuantity;

    const createdOrder = store.submitOrder();
    TestBed.tick();
    await Promise.resolve();
    await Promise.resolve();

    const updatedStock = store.catalog().find((p) => p.id === 'prod-nvme-2tb')!.stockQuantity;
    expect(updatedStock).toBe(initialStock - 2);
    expect(store.cartItemCount()).toBe(0);
    expect(store.selectedOrderId()).toBe(createdOrder.id);
    expect(store.orderTrackingResource.hasValue()).toBe(true);
    expect(store.orderTrackingResource.value()?.orderId).toBe(createdOrder.id);
  });

  it('expõe erro do resource() quando o gateway falha e recupera após reload()', async () => {
    store.toggleSimulateTrackingFailure();
    store.reloadOrderTracking();
    TestBed.tick();
    await Promise.resolve();
    await Promise.resolve();

    expect(store.orderTrackingResource.status()).toBe('error');
    expect(store.orderTrackingResource.error()?.message).toContain('Erro simulado');

    store.toggleSimulateTrackingFailure();
    store.reloadOrderTracking();
    TestBed.tick();
    await Promise.resolve();
    await Promise.resolve();

    expect(store.orderTrackingResource.status()).toBe('resolved');
    expect(store.orderTrackingResource.hasValue()).toBe(true);
  });
});
