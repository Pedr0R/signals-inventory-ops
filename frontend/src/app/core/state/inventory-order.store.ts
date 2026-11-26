import {
  computed,
  effect,
  inject,
  Injectable,
  linkedSignal,
  resource,
  signal,
  untracked,
} from '@angular/core';
import {
  computeInventoryMetrics,
  filterAndSortCatalog,
  paginateItems,
} from '../domain/catalog-filter';
import { INITIAL_CATALOG, INITIAL_MOVEMENTS, INITIAL_ORDERS } from '../domain/catalog-seed';
import {
  buildCartLineSummaries,
  calculatePricingBreakdown,
  getShippingOptionsForRegion,
} from '../domain/pricing-calculator';
import {
  CatalogFilterState,
  CatalogSortField,
  InventoryMetrics,
  ProductCategory,
  ProductItem,
  StockStatus,
} from '../models/inventory.models';
import { SystemMovement } from '../models/movement.models';
import {
  CartEntry,
  CartLineSummary,
  OrderLineSnapshot,
  OrderRecord,
  OrderTrackingDetails,
  PricingBreakdown,
  ReactivityEvent,
  ShippingOption,
  ShippingRegion,
  ShippingTier,
  SignalPrimitiveKind,
} from '../models/order.models';
import { ORDER_TRACKING_GATEWAY } from '../ports/order-tracking.port';
import { STORAGE_PORT } from '../ports/storage.port';
import {
  createOrderSubmissionDrafts,
  createStockMovementDraft,
  createSystemMovement,
  MovementDraft,
} from './store-movement-factory';
import {
  parsePersistedWorkspace,
  PersistedOrderWorkspace,
  STORAGE_KEY,
} from './store-persistence';

const CATALOG_PAGE_SIZE = 6;
const LIVE_SYNC_INTERVAL_MS = 3500;
const MAX_LOG_ENTRIES = 14;
const MAX_MOVEMENTS = 200;
const DEFAULT_CUSTOMER_NAME = 'Operações Cloud Brasil';

const DEFAULT_CART_ENTRIES: readonly CartEntry[] = [
  { productId: 'prod-nvme-2tb', quantity: 2 },
  { productId: 'prod-ram-64gb', quantity: 1 },
];

interface TrackingResourceParams {
  readonly order: OrderRecord;
  readonly simulateFailure: boolean;
}

/**
 * Store reativa central baseada em Angular Signals para catálogo, carrinho,
 * pedidos, rastreamento assíncrono e histórico auditável de movimentações.
 */
@Injectable({ providedIn: 'root' })
export class InventoryOrderStore {
  private readonly storage = inject(STORAGE_PORT);
  private readonly trackingGateway = inject(ORDER_TRACKING_GATEWAY);

  private readonly catalogSignal = signal<readonly ProductItem[]>(INITIAL_CATALOG);
  private readonly searchQuerySignal = signal<string>('');
  private readonly selectedCategorySignal = signal<ProductCategory | 'all'>('all');
  private readonly stockFilterSignal = signal<StockStatus | 'all'>('all');
  private readonly sortBySignal = signal<CatalogSortField>('name');
  private readonly cartEntriesSignal = signal<readonly CartEntry[]>(DEFAULT_CART_ENTRIES);
  private readonly customerNameSignal = signal<string>(DEFAULT_CUSTOMER_NAME);
  private readonly couponInputSignal = signal<string>('SIGNALS10');
  private readonly selectedRegionSignal = signal<ShippingRegion>('sudeste');
  private readonly ordersSignal = signal<readonly OrderRecord[]>(INITIAL_ORDERS);
  private readonly selectedOrderIdSignal = signal<string | null>(INITIAL_ORDERS[0]?.id ?? null);
  private readonly liveWarehouseSyncSignal = signal<boolean>(false);
  private readonly simulateTrackingFailureSignal = signal<boolean>(false);
  private readonly activityLogSignal = signal<readonly ReactivityEvent[]>([]);
  private readonly movementsSignal = signal<readonly SystemMovement[]>(INITIAL_MOVEMENTS);
  private logSequence = 0;
  private movementSequence = 0;

  public readonly catalog = this.catalogSignal.asReadonly();
  public readonly searchQuery = this.searchQuerySignal.asReadonly();
  public readonly selectedCategory = this.selectedCategorySignal.asReadonly();
  public readonly stockFilter = this.stockFilterSignal.asReadonly();
  public readonly sortBy = this.sortBySignal.asReadonly();
  public readonly cartEntries = this.cartEntriesSignal.asReadonly();
  public readonly customerName = this.customerNameSignal.asReadonly();
  public readonly couponInput = this.couponInputSignal.asReadonly();
  public readonly selectedRegion = this.selectedRegionSignal.asReadonly();
  public readonly orders = this.ordersSignal.asReadonly();
  public readonly selectedOrderId = this.selectedOrderIdSignal.asReadonly();
  public readonly liveWarehouseSync = this.liveWarehouseSyncSignal.asReadonly();
  public readonly simulateTrackingFailure = this.simulateTrackingFailureSignal.asReadonly();
  public readonly activityLog = this.activityLogSignal.asReadonly();
  public readonly movements = this.movementsSignal.asReadonly();

  public readonly movementCount = computed<number>(() => this.movementsSignal().length);

  public readonly filterState = computed<CatalogFilterState>(() => ({
    searchQuery: this.searchQuerySignal(),
    category: this.selectedCategorySignal(),
    stockStatus: this.stockFilterSignal(),
    sortBy: this.sortBySignal(),
  }));

  public readonly filteredCatalog = computed<readonly ProductItem[]>(() =>
    filterAndSortCatalog(this.catalogSignal(), this.filterState()),
  );

  public readonly totalPages = computed<number>(() =>
    Math.max(1, Math.ceil(this.filteredCatalog().length / CATALOG_PAGE_SIZE)),
  );

  public readonly currentPage = linkedSignal<CatalogFilterState, number>({
    source: this.filterState,
    computation: () => 1,
  });

  public readonly paginatedCatalog = computed<readonly ProductItem[]>(() =>
    paginateItems(this.filteredCatalog(), this.currentPage(), CATALOG_PAGE_SIZE),
  );

  public readonly inventoryMetrics = computed<InventoryMetrics>(() =>
    computeInventoryMetrics(this.catalogSignal()),
  );

  public readonly availableShippingOptions = computed<readonly ShippingOption[]>(() =>
    getShippingOptionsForRegion(this.selectedRegionSignal()),
  );

  public readonly selectedShippingTier = linkedSignal<readonly ShippingOption[], ShippingTier>({
    source: this.availableShippingOptions,
    computation: (options, previous): ShippingTier => {
      const previousTier = previous?.value;
      if (previousTier && options.some((option) => option.tier === previousTier)) {
        return previousTier;
      }

      return 'standard';
    },
  });

  public readonly cartLines = computed<readonly CartLineSummary[]>(() =>
    buildCartLineSummaries(this.cartEntriesSignal(), this.catalogSignal()),
  );

  public readonly cartQuantityMap = computed<ReadonlyMap<string, number>>(() => {
    const quantities = new Map<string, number>();
    for (const entry of this.cartEntriesSignal()) {
      quantities.set(entry.productId, entry.quantity);
    }

    return quantities;
  });

  public readonly hasStockConflicts = computed<boolean>(() =>
    this.cartLines().some((line) => line.hasStockConflict),
  );

  public readonly cartItemCount = computed<number>(() =>
    this.cartEntriesSignal().reduce((total, entry) => total + entry.quantity, 0),
  );

  public readonly pricing = computed<PricingBreakdown>(() =>
    calculatePricingBreakdown(
      this.cartLines(),
      this.selectedRegionSignal(),
      this.selectedShippingTier(),
      this.couponInputSignal(),
    ),
  );

  public readonly canSubmitOrder = computed<boolean>(
    () =>
      this.cartLines().length > 0 &&
      !this.hasStockConflicts() &&
      this.customerNameSignal().trim().length >= 3,
  );

  public readonly selectedOrder = computed<OrderRecord | null>(() => {
    const targetId = this.selectedOrderIdSignal();
    return this.ordersSignal().find((order) => order.id === targetId) ?? null;
  });

  public readonly totalRevenueCents = computed<number>(() =>
    this.ordersSignal().reduce((sum, order) => sum + order.totalCents, 0),
  );

  public readonly orderTrackingResource = resource<
    OrderTrackingDetails,
    TrackingResourceParams | undefined
  >({
    params: (): TrackingResourceParams | undefined => {
      const order = this.selectedOrder();
      if (!order) {
        return undefined;
      }

      return { order, simulateFailure: this.simulateTrackingFailureSignal() };
    },
    loader: ({ params, abortSignal }): Promise<OrderTrackingDetails> =>
      this.trackingGateway.fetchTrackingDetails({
        order: params.order,
        abortSignal,
        simulateFailure: params.simulateFailure,
      }),
  });

  constructor() {
    this.hydrateFromStorage();
    this.registerPersistenceEffect();
    this.registerLiveWarehouseEffect();
    this.appendEvent('signal', 'Store inicializada com grafo reativo de pedidos e estoque.');
  }

  /** @example store.setSearchQuery('NVMe'); */
  public setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  /** @example store.setCategory('redes'); */
  public setCategory(category: ProductCategory | 'all'): void {
    this.selectedCategorySignal.set(category);
  }

  /** @example store.setStockFilter('low-stock'); */
  public setStockFilter(status: StockStatus | 'all'): void {
    this.stockFilterSignal.set(status);
  }

  /** @example store.setSortBy('price-desc'); */
  public setSortBy(sortBy: CatalogSortField): void {
    this.sortBySignal.set(sortBy);
  }

  /** @example store.clearFilters(); */
  public clearFilters(): void {
    this.searchQuerySignal.set('');
    this.selectedCategorySignal.set('all');
    this.stockFilterSignal.set('all');
    this.sortBySignal.set('name');
    this.appendEvent('linkedSignal', 'Filtros limpos; paginação redefinida para página 1.');
  }

  /** @example store.setPage(2); */
  public setPage(page: number): void {
    if (!Number.isInteger(page) || page < 1 || page > this.totalPages()) {
      throw new Error(
        `Página solicitada "${page}" fora do intervalo esperado (inteiro entre 1 e ${this.totalPages()}).`,
      );
    }

    this.currentPage.set(page);
  }

  /** @example store.addToCart('prod-nvme-2tb', 1); */
  public addToCart(productId: string, quantity = 1): void {
    const product = this.findProductOrThrow(productId);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Quantidade inválida "${quantity}". Esperado inteiro >= 1.`);
    }

    if (product.stockQuantity <= 0) {
      throw new Error(`Produto "${product.sku}" esgotado (estoque atual: 0). Esperado estoque >= 1.`);
    }

    const currentQty = this.cartQuantityMap().get(productId) ?? 0;
    const nextQty = Math.min(product.stockQuantity, currentQty + quantity);
    this.upsertCartEntry(productId, nextQty);
    this.appendEvent('computed', `${product.sku} atualizado para ${nextQty} un. no pedido.`);
    this.recordMovement({
      category: 'carrinho',
      direction: 'entrada',
      title: `Item adicionado · ${product.name}`,
      details: `Pedido em montagem atualizado para ${nextQty} un.`,
      sku: product.sku,
      quantityDelta: nextQty - currentQty,
    });
  }

  /** @example store.updateCartQuantity('prod-nvme-2tb', 3); */
  public updateCartQuantity(productId: string, quantity: number): void {
    if (!Number.isInteger(quantity)) {
      throw new Error(`Quantidade inválida "${quantity}". Esperado número inteiro.`);
    }

    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const product = this.findProductOrThrow(productId);
    const previousQty = this.cartQuantityMap().get(productId) ?? 0;
    this.upsertCartEntry(productId, quantity);
    const delta = quantity - previousQty;
    this.recordMovement({
      category: 'carrinho',
      direction: delta >= 0 ? 'entrada' : 'saida',
      title: `Quantidade ajustada · ${product.name}`,
      details: `Alterado de ${previousQty} un. para ${quantity} un. no rascunho.`,
      sku: product.sku,
      quantityDelta: delta,
    });
  }

  /** @example store.removeFromCart('prod-nvme-2tb'); */
  public removeFromCart(productId: string): void {
    const previousQty = this.cartQuantityMap().get(productId) ?? 0;
    const product = this.catalogSignal().find((item) => item.id === productId);
    this.cartEntriesSignal.update((entries) =>
      entries.filter((entry) => entry.productId !== productId),
    );
    this.appendEvent('signal', `Item ${productId} removido do rascunho de pedido.`);
    this.recordMovement({
      category: 'carrinho',
      direction: 'saida',
      title: `Item removido · ${product?.name ?? productId}`,
      details: `Removido do rascunho de pedido (${previousQty} un.).`,
      sku: product?.sku ?? null,
      quantityDelta: previousQty > 0 ? -previousQty : null,
    });
  }

  /** @example store.clearCart(); */
  public clearCart(): void {
    const count = this.cartItemCount();
    this.cartEntriesSignal.set([]);
    this.appendEvent('signal', 'Rascunho de pedido esvaziado.');
    this.recordMovement({
      category: 'carrinho',
      direction: 'saida',
      title: 'Carrinho esvaziado',
      details: `Rascunho limpo manualmente (${count} un. descartadas).`,
      quantityDelta: count > 0 ? -count : null,
    });
  }

  /** @example store.adjustProductStock('prod-sfp-transceiver', 5); */
  public adjustProductStock(productId: string, delta: number): void {
    if (!Number.isInteger(delta)) {
      throw new Error(`Delta de estoque inválido "${delta}". Esperado número inteiro.`);
    }

    const product = this.findProductOrThrow(productId);
    const updatedStock = Math.max(0, product.stockQuantity + delta);
    this.catalogSignal.update((items) =>
      items.map((item) =>
        item.id === productId ? { ...item, stockQuantity: updatedStock } : item,
      ),
    );

    const sign = delta >= 0 ? `+${delta}` : `${delta}`;
    this.appendEvent('signal', `Estoque de ${product.sku} ajustado (${sign} -> ${updatedStock} un.).`);
    this.recordMovement(createStockMovementDraft(product, delta, updatedStock, 'manual'));
  }

  /** @example store.setCustomerName('DataCenter Sul Ltda'); */
  public setCustomerName(name: string): void {
    this.customerNameSignal.set(name);
  }

  /** @example store.setCouponInput('VIP20'); */
  public setCouponInput(coupon: string): void {
    this.couponInputSignal.set(coupon);
  }

  /** @example store.setRegion('norte'); */
  public setRegion(region: ShippingRegion): void {
    const previousTier = this.selectedShippingTier();
    this.selectedRegionSignal.set(region);
    const resolvedTier = this.selectedShippingTier();
    const note =
      previousTier !== resolvedTier
        ? `Região ${region}: frete "${previousTier}" indisponível -> fallback "${resolvedTier}".`
        : `Região ${region}: frete "${resolvedTier}" preservado pelo linkedSignal.`;
    this.appendEvent('linkedSignal', note);
    this.recordMovement({
      category: 'logistica',
      direction: 'neutro',
      title: `Região alterada para ${region.toUpperCase()}`,
      details: note,
      source: previousTier !== resolvedTier ? 'sistema' : 'manual',
    });
  }

  /** @example store.setShippingTier('express'); */
  public setShippingTier(tier: ShippingTier): void {
    const supported = this.availableShippingOptions().some((opt) => opt.tier === tier);
    if (!supported) {
      throw new Error(
        `Modalidade "${tier}" não suportada na região "${this.selectedRegionSignal()}".`,
      );
    }

    this.selectedShippingTier.set(tier);
  }

  /** @example const order = store.submitOrder(); */
  public submitOrder(): OrderRecord {
    if (!this.canSubmitOrder()) {
      throw new Error(
        'Pedido inválido para envio: verifique itens no carrinho, conflitos de estoque e nome do cliente (>= 3 caracteres).',
      );
    }

    const newOrder = this.buildOrderRecord();
    this.deductPurchasedStock();
    this.ordersSignal.update((orders) => [newOrder, ...orders]);
    this.cartEntriesSignal.set([]);
    this.selectedOrderIdSignal.set(newOrder.id);
    this.appendEvent('resource', `Pedido ${newOrder.id} emitido; carregando rastreamento.`);
    for (const draft of createOrderSubmissionDrafts(newOrder)) {
      this.recordMovement(draft);
    }

    return newOrder;
  }

  /** @example store.selectOrder('PED-2026-1042'); */
  public selectOrder(orderId: string): void {
    this.selectedOrderIdSignal.set(orderId);
    this.appendEvent('resource', `Pedido ${orderId} selecionado para consulta assíncrona.`);
  }

  /** @example store.reloadOrderTracking(); */
  public reloadOrderTracking(): void {
    this.orderTrackingResource.reload();
    this.appendEvent('resource', 'Recarregamento manual disparado em orderTrackingResource.');
    this.recordMovement({
      category: 'logistica',
      direction: 'neutro',
      title: 'Rastreamento recarregado',
      details: `Consulta assíncrona reexecutada para ${this.selectedOrderIdSignal() ?? 'nenhum pedido'}.`,
      orderId: this.selectedOrderIdSignal(),
      source: 'sistema',
    });
  }

  /** @example store.toggleLiveWarehouseSync(); */
  public toggleLiveWarehouseSync(): void {
    this.liveWarehouseSyncSignal.update((active) => !active);
    const status = this.liveWarehouseSyncSignal() ? 'ativado' : 'pausado';
    this.appendEvent('effect', `Simulador de armazém ao vivo ${status}.`);
    this.recordMovement({
      category: 'sistema',
      direction: 'neutro',
      title: `Armazém ao vivo ${status}`,
      details: 'Effect reativo com onCleanup atualizado pelo operador.',
      source: 'sistema',
    });
  }

  /** @example store.toggleSimulateTrackingFailure(); */
  public toggleSimulateTrackingFailure(): void {
    this.simulateTrackingFailureSignal.update((flag) => !flag);
  }

  /** @example store.clearMovements(); */
  public clearMovements(): void {
    this.movementsSignal.set([]);
    this.appendEvent('signal', 'Histórico de movimentações limpo pelo operador.');
  }

  /** @example store.resetDemoState(); */
  public resetDemoState(): void {
    this.storage.removeItem(STORAGE_KEY);
    this.catalogSignal.set(INITIAL_CATALOG);
    this.cartEntriesSignal.set(DEFAULT_CART_ENTRIES);
    this.customerNameSignal.set(DEFAULT_CUSTOMER_NAME);
    this.couponInputSignal.set('SIGNALS10');
    this.selectedRegionSignal.set('sudeste');
    this.ordersSignal.set(INITIAL_ORDERS);
    this.selectedOrderIdSignal.set(INITIAL_ORDERS[0]?.id ?? null);
    this.movementsSignal.set(INITIAL_MOVEMENTS);
    this.liveWarehouseSyncSignal.set(false);
    this.simulateTrackingFailureSignal.set(false);
    this.clearFilters();
    this.appendEvent('effect', 'Estado da demonstração restaurado para os valores iniciais.');
  }

  private hydrateFromStorage(): void {
    const saved = parsePersistedWorkspace(this.storage.readItem(STORAGE_KEY));
    if (!saved) {
      return;
    }

    if (saved.cartEntries) {
      this.cartEntriesSignal.set(saved.cartEntries);
    }
    if (saved.customerName) {
      this.customerNameSignal.set(saved.customerName);
    }
    if (saved.couponInput !== undefined) {
      this.couponInputSignal.set(saved.couponInput);
    }
    if (saved.selectedRegion) {
      this.selectedRegionSignal.set(saved.selectedRegion);
    }
    if (saved.orders && saved.orders.length > 0) {
      this.ordersSignal.set(saved.orders);
      this.selectedOrderIdSignal.set(saved.orders[0].id);
    }
    if (saved.movements) {
      this.movementsSignal.set(saved.movements);
    }
  }

  private registerPersistenceEffect(): void {
    effect(() => {
      const payload: PersistedOrderWorkspace = {
        cartEntries: this.cartEntriesSignal(),
        customerName: this.customerNameSignal(),
        couponInput: this.couponInputSignal(),
        selectedRegion: this.selectedRegionSignal(),
        orders: this.ordersSignal(),
        movements: this.movementsSignal(),
      };
      this.storage.writeItem(STORAGE_KEY, JSON.stringify(payload));
    });
  }

  private registerLiveWarehouseEffect(): void {
    effect((onCleanup) => {
      if (!this.liveWarehouseSyncSignal()) {
        return;
      }

      const timerId = setInterval(() => {
        untracked(() => this.applyRandomWarehouseMovement());
      }, LIVE_SYNC_INTERVAL_MS);

      onCleanup(() => clearInterval(timerId));
    });
  }

  private applyRandomWarehouseMovement(): void {
    const items = this.catalogSignal();
    if (items.length === 0) {
      return;
    }

    const index = Math.floor(Math.random() * items.length);
    const target = items[index];
    const delta = Math.random() < 0.6 ? -2 : 3;
    const nextStock = Math.max(0, target.stockQuantity + delta);

    this.catalogSignal.update((list) =>
      list.map((item) => (item.id === target.id ? { ...item, stockQuantity: nextStock } : item)),
    );
    const label = delta >= 0 ? `+${delta}` : `${delta}`;
    this.appendEvent('effect', `Armazém ao vivo: ${target.sku} (${label} un. -> ${nextStock}).`);
    this.recordMovement(createStockMovementDraft(target, delta, nextStock, 'armazem-ao-vivo'));
  }

  private findProductOrThrow(productId: string): ProductItem {
    const found = this.catalogSignal().find((item) => item.id === productId);
    if (!found) {
      throw new Error(`Produto "${productId}" não encontrado no catálogo ativo.`);
    }

    return found;
  }

  private upsertCartEntry(productId: string, quantity: number): void {
    this.cartEntriesSignal.update((entries) => {
      const exists = entries.some((entry) => entry.productId === productId);
      if (!exists) {
        return [...entries, { productId, quantity }];
      }

      return entries.map((entry) =>
        entry.productId === productId ? { ...entry, quantity } : entry,
      );
    });
  }

  private buildOrderRecord(): OrderRecord {
    const orderItems: OrderLineSnapshot[] = this.cartLines().map((line) => ({
      productId: line.product.id,
      productName: line.product.name,
      sku: line.product.sku,
      quantity: line.requestedQuantity,
      unitPriceCents: line.product.unitPriceCents,
    }));

    const sequence = 1043 + this.ordersSignal().length;
    return {
      id: `PED-2026-${sequence}`,
      customerName: this.customerNameSignal().trim(),
      region: this.selectedRegionSignal(),
      shippingTier: this.selectedShippingTier(),
      createdAtIso: new Date().toISOString(),
      totalCents: this.pricing().grandTotalCents,
      itemCount: this.cartItemCount(),
      items: orderItems,
    };
  }

  private deductPurchasedStock(): void {
    const quantities = this.cartQuantityMap();
    this.catalogSignal.update((items) =>
      items.map((item) => {
        const orderedQty = quantities.get(item.id) ?? 0;
        return orderedQty === 0
          ? item
          : { ...item, stockQuantity: Math.max(0, item.stockQuantity - orderedQty) };
      }),
    );
  }

  private appendEvent(primitive: SignalPrimitiveKind, summary: string): void {
    this.logSequence += 1;
    const entry: ReactivityEvent = {
      id: `evt-${this.logSequence}`,
      timestampIso: new Date().toISOString(),
      primitive,
      summary,
    };

    this.activityLogSignal.update((events) => [entry, ...events].slice(0, MAX_LOG_ENTRIES));
  }

  private recordMovement(draft: MovementDraft): void {
    this.movementSequence += 1;
    const movement = createSystemMovement(this.movementSequence, draft);
    this.movementsSignal.update((list) => [movement, ...list].slice(0, MAX_MOVEMENTS));
  }
}
