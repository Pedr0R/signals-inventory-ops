# Roadmap Fullstack — Spring Boot + PostgreSQL

## Decisão Arquitetural

O **signals-inventory-ops** adota uma arquitetura fullstack separada por camadas na raiz do repositório:

- **Frontend (`frontend/`)**: Angular 21 (zoneless + Signals + Router) com telas de **Operação** (`/`) e **Histórico** (`/historico`).
- **Backend (`backend/`)**: Java 21 + **Spring Boot** (API REST, JPA, Bean Validation, Flyway e Actuator).
- **Banco de Dados (`database/` + Flyway)**: **PostgreSQL 16** com versionamento de schema e carga inicial.
- **Containerização (`docker-compose.yml`)**: serviços `postgres`, `backend` e `frontend` conectados na rede `signals-net` com healthchecks.

---

## O que já está estruturado

- **Schema e Migrações Flyway (`backend/src/main/resources/db/migration/`)**:
  - `V1__create_inventory_and_movements.sql`: tabelas `products` (com `@Version` para lock otimista) e `system_movements`.
  - `V2__seed_initial_catalog_and_movements.sql`: catálogo e movimentações iniciais.
- **Endpoints iniciais no Backend**:
  - `GET /api/products` e `PATCH /api/products/{id}/stock` (baixa/reposição transacional gerando registro automático em `system_movements`).
  - `GET /api/movements` (com filtros opcionais `category` e `direction`) e `POST /api/movements`.
  - `GET /actuator/health`.
- **Fronteiras no Frontend (`frontend/src/app/core/ports/`)**:
  - `STORAGE_PORT` e `ORDER_TRACKING_GATEWAY` desacoplados da `InventoryOrderStore`.

---

## Próximas Fases de Evolução

### Fase 1 — Integração HTTP Completa de Catálogo, Pedidos e Histórico
- Criar adapters HTTP no Angular para `CatalogGateway`, `OrderCommandGateway` e `MovementGateway` consumindo `/api/products`, `/api/orders` e `/api/movements`.
- Implementar persistência de pedidos (`orders` e `order_items`) no Spring Boot com validação server-side de cupons, frete e impostos.

### Fase 2 — Tempo Real via Server-Sent Events (SSE)
- Expor endpoint SSE (`/api/inventory/events`) no Spring Boot publicando alterações de estoque e movimentações em tempo real.
- Substituir o simulador `liveWarehouseSync` (`effect` + `setInterval`) pela assinatura do stream SSE atualizando `catalogSignal` e `movementsSignal`.

### Fase 3 — Autenticação e Perfis
- Configurar Spring Security + JWT diferenciando papéis:
  - `WAREHOUSE_OPERATOR`: reposição e ajuste manual de estoque.
  - `BUYER`: montagem, emissão e acompanhamento de pedidos.
