# Roadmap Fullstack — Spring Boot + PostgreSQL

## Decisão Arquitetural

O **signals-inventory-ops** será evoluído para uma arquitetura fullstack utilizando:

- **Backend**: Java + **Spring Boot** (API REST + Server-Sent Events).
- **Banco de Dados**: **PostgreSQL** com migrações versionadas via **Flyway**.
- **Frontend**: Angular 21 (zoneless + Signals) conectado às APIs do backend através das portas de domínio já existentes.

---

## Mapeamento das Fronteiras no Frontend

As portas definidas em `src/app/core/ports/` permitem substituir as implementações simuladas por adapters HTTP/SSE sem alterar o grafo reativo de `InventoryOrderStore`:

- **`ORDER_TRACKING_GATEWAY`** (`src/app/core/ports/order-tracking.port.ts`):
  - Substituir `SimulatedOrderTrackingGateway` por um adapter HTTP consumindo `GET /api/orders/{id}/tracking` com suporte a `AbortSignal`, preservando o uso declarativo de `orderTrackingResource` (`resource()`).
- **Novas Portas de Catálogo e Pedidos**:
  - `CatalogGateway`: `GET /api/products` e `PATCH /api/products/{id}/stock`.
  - `OrderCommandGateway`: `POST /api/orders` e `GET /api/orders`.
- **Sincronização de Estoque em Tempo Real**:
  - Substituir o simulador `liveWarehouseSync` (`effect` + `setInterval`) por assinatura **SSE** (`SseEmitter` / WebFlux) emitindo alterações de estoque que atualizam `catalogSignal` em tempo real.

---

## Fases de Evolução

### Fase 1 — API REST + PostgreSQL
- Modelar tabelas `products`, `orders`, `order_items` e `tracking_events` com Flyway.
- Revalidar no servidor regras de precificação, cupons (`SIGNALS10`, `VIP20`, `FRETEGRATIS`), frete regional e impostos.
- Garantir baixa atômica de estoque na emissão de pedidos com controle de concorrência (`@Version` otimista ou `SELECT ... FOR UPDATE`).

### Fase 2 — Tempo Real via SSE
- Expor endpoint SSE (`/api/inventory/events`) publicando atualizações de saldo de armazém e transições de rastreamento.
- Integrar o stream no Angular atualizando `catalogSignal` para disparar automaticamente `inventoryMetrics`, `hasStockConflicts` e `canSubmitOrder`.

### Fase 3 — Autenticação e Perfis
- Configurar Spring Security + JWT diferenciando papéis:
  - `WAREHOUSE_OPERATOR`: reposição e ajuste manual de estoque.
  - `BUYER`: montagem, emissão e acompanhamento de pedidos.

### Fase 4 — Infraestrutura e CI
- Adicionar `docker-compose.yml` orquestrando Angular, Spring Boot e PostgreSQL.
- Configurar pipeline de CI no GitHub Actions executando build e testes automatizados de frontend e backend.
