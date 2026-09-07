# Configuration Domain (`domains/configuration/`)

Owns persisted business/runtime product configuration such as maintenance mode, supported app versions, update policy, feature rollout, bootstrap decisions, and startup routing.

It does **not** own environment variables, secrets, ports, database URLs, provider credentials, or logging configuration; those remain API/bootstrap/platform concerns.

## Guides

- [Partner Bootstrap Configuration](./PARTNER-BOOTSTRAP-CONFIG.md) — quick guide to the Partner bootstrap response flow, ownership, exact files, extension rules, persistence behavior, and verification commands.

## Core implementation

- `application/contracts/` — transport-neutral Configuration contracts.
- `application/use-cases/` — configuration evaluation/orchestration.
- `application/ConfigProvider.ts` — persisted config lookup with explicit defaults.
- `infrastructure/repositories/` — Prisma-backed Configuration persistence adapters.
- `config.module.ts` — Configuration DI registrations.
- `tests/` — focused Configuration behavior tests.

Architecture authority: `docs/MASTER-BACKEND-CONSTITUTION.md` §19.
