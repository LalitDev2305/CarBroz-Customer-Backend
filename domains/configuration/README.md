# Configuration Domain (`domains/configuration/`)

Owns persisted business/runtime product configuration such as maintenance mode, supported app versions, update policy, feature rollout, bootstrap decisions, and startup routing.

It does **not** own environment variables, secrets, ports, database URLs, provider credentials, or logging configuration; those remain API/bootstrap/platform concerns.

## Developer guides

- [Partner Bootstrap Configuration — Developer Guide](./PARTNER-BOOTSTRAP-CONFIG.md) — complete flow diagrams, ownership map, exact files/classes, persistence behavior, and step-by-step instructions for adding, renaming, deleting, restructuring, or changing Partner bootstrap request/response fields, routes, methods, headers, defaults, runtime configuration, and the common API envelope.

## Core implementation

- `application/contracts/` — transport-neutral Configuration contracts.
- `application/use-cases/` — configuration evaluation/orchestration.
- `application/ConfigProvider.ts` — persisted config lookup with explicit defaults.
- `infrastructure/repositories/` — Prisma-backed Configuration persistence adapters.
- `config.module.ts` — Configuration DI registrations.
- `tests/` — focused Configuration behavior tests.

Architecture authority: `docs/MASTER-BACKEND-CONSTITUTION.md` §19.
