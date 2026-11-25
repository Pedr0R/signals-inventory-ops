# signals-inventory-ops

Aplicação de exemplo em **Angular 21** (standalone e zoneless, com `ChangeDetectionStrategy.OnPush`) modelando um painel de **gestão de pedidos, carrinho inteligente e controle de estoque em tempo real**.

## Primitivos de Angular Signals Demonstrados

- **`signal()`**: estado encapsulado na store central (`InventoryOrderStore`) com leitores expostos via `.asReadonly()`.
- **`computed()`**: grafo reativo multi-nível cobrindo filtragem/ordenação do catálogo, métricas agregadas de inventário, detecção automática de conflitos de estoque no carrinho, cálculo financeiro (desconto progressivo por volume, cupons, frete regional e impostos) e validação de envio (`canSubmitOrder`).
- **`linkedSignal()`**:
  - `currentPage`: redefine automaticamente para a página `1` sempre que os filtros ou ordenação do catálogo mudam, permanecendo gravável para paginação manual.
  - `selectedShippingTier`: preserva a modalidade escolhida ao trocar entre regiões compatíveis (ex.: `sudeste` → `sul` mantendo `same-day`) e aplica fallback para `standard` quando a nova região não suporta a opção anterior.
- **`resource()`**: `orderTrackingResource` carrega de forma declarativa e assíncrona os eventos de rastreamento do pedido selecionado, com suporte a cancelamento via `AbortSignal`, estados `loading`/`error`/`resolved` e `.reload()`.
- **`effect()` com `onCleanup` e `untracked`**:
  - Persistência automática do rascunho de pedido e histórico atrás da porta `STORAGE_PORT`.
  - Simulador opcional de movimentação concorrente de armazém com limpeza automática do `setInterval` via `onCleanup` e registro de eventos sem dependências cíclicas via `untracked`.
- **Signal Component I/O & Queries**: `input()`, `input.required()`, `output()`, `model()` e `viewChild()`.

## Estrutura do Projeto

- `src/app/core/models/`: interfaces e tipos de domínio (`inventory.models.ts`, `order.models.ts`).
- `src/app/core/ports/`: portas e `InjectionToken` para persistência (`STORAGE_PORT`) e rastreamento (`ORDER_TRACKING_GATEWAY`).
- `src/app/core/domain/`: regras puras de negócio (filtros, métricas, paginação, cálculo de preços e seed inicial).
- `src/app/core/services/`: gateway assíncrono simulado com suporte a `AbortSignal` e falha controlada.
- `src/app/core/state/`: store reativa (`InventoryOrderStore`) e parser seguro de persistência.
- `src/app/features/` e `src/app/shared/`: componentes standalone com `OnPush`.
- `src/app/testing/`: fakes nomeados (`FakeStorageAdapter`, `FakeOrderTrackingGateway`).

## Comandos

```bash
npm start       # Inicia o servidor de desenvolvimento em http://localhost:4200
npm run build   # Gera o build de produção em dist/
npm test        # Executa a suíte de testes unitários e de integração com Vitest
```
