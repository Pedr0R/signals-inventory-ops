# Database (`database/`)

Camada de configuração inicial do **PostgreSQL 16** utilizado pelo `signals-inventory-ops`.

- `init/01-init-extensions.sql`: script montado em `/docker-entrypoint-initdb.d` para preparar extensões na primeira subida do volume.
- O schema relacional (`products`, `system_movements`) e os seeds idempotentes são versionados pelo **Flyway** em `backend/src/main/resources/db/migration/`.
