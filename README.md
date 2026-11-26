# signals-inventory-ops

Projeto fullstack organizado em **Angular 21 (Signals + zoneless)**, **Spring Boot** e **PostgreSQL**, modelando um painel de **gestão de pedidos, carrinho inteligente, controle de estoque e histórico auditável de movimentações**.

## Estrutura do Repositório

```text
.
├── frontend/          # Aplicação Angular 21 standalone & zoneless
├── backend/           # API REST Java + Spring Boot + Flyway + JPA
├── database/          # Scripts iniciais do PostgreSQL
├── docs/              # Roadmap e decisões arquiteturais
├── docker-compose.yml # Orquestração completa (postgres + backend + frontend)
└── .env.example       # Variáveis de ambiente padrão
```

## Primitivos de Angular Signals Demonstrados (`frontend/`)

- **`signal()`**: estado encapsulado em `InventoryOrderStore` com leitores `.asReadonly()`.
- **`computed()`**: grafo reativo multi-nível (filtros do catálogo, métricas de inventário, detecção de conflito de estoque, precificação completa, resumo da tela de **Histórico**).
- **`linkedSignal()`**:
  - `currentPage` na operação e no histórico (`/historico`), resetando automaticamente para `1` quando filtros mudam.
  - `selectedShippingTier` preservando ou revertendo a modalidade de frete ao trocar a região.
- **`resource()`**: `orderTrackingResource` para carregamento assíncrono com `AbortSignal`, erro controlado e `.reload()`.
- **`effect()` com `onCleanup` e `untracked`**: persistência em `STORAGE_PORT` e simulador de armazém ao vivo.
- **Telas**:
  - `/` (`Operação`): catálogo, carrinho, precificação, rastreamento e inspetor reativo.
  - `/historico` (`Histórico`): listagem paginada e filtrável de todas as movimentações do sistema (estoque, pedidos, carrinho, logística e eventos do sistema).

## Comandos

### Subir toda a stack via Docker

```bash
cp .env.example .env
docker compose up --build
```

- **Frontend**: `http://localhost:4200`
- **Backend API**: `http://localhost:8080/api/products` e `http://localhost:8080/api/movements`
- **Actuator Health**: `http://localhost:8080/actuator/health`

### Executar Frontend localmente

```bash
cd frontend
npm start       # Servidor Angular em http://localhost:4200
npm run build   # Build de produção em frontend/dist/
npm test        # Testes unitários e de integração (Vitest)
```

### Executar Backend localmente

```bash
cd backend
mvn test        # Testes unitários e de integração (JUnit 5 + Mockito + H2)
mvn spring-boot:run
```

## Evolução Fullstack

O plano detalhado de evolução contínua com **Spring Boot + PostgreSQL** está documentado em [`docs/roadmap-fullstack.md`](docs/roadmap-fullstack.md).
