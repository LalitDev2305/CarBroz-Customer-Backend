# Final Enterprise Architecture Specification

Complete architectural specification for the CarBroz Enterprise Modular Monolith.

## 1. 4-Pillar Layering Architecture

The workspace enforces a strict 4-pillar architectural hierarchy:

1. **`apps/` (Application Layer)**: Composition root, Awilix DI container, API controllers, HTTP routes, server startup.
2. **`domains/` (Domain Bounded Contexts)**: Pure business logic, Domain Entities, Value Objects, Repository Interfaces, Application Use Cases, Prisma Repositories.
3. **`platform/` (Platform Infrastructure)**: Technical capabilities (Database, Redis Cache, BullMQ Queue, S3 Storage, Event Bus).
4. **`shared/` (Shared Kernel & UI SDK)**: Base primitives, Domain Event interfaces, Result types, Money, SDUI Component contracts.

---

## 2. Architectural Control Rules

- **Strict Downward Dependency**: `apps` -> `domains` -> `platform` -> `shared`.
- **Public Barrel Isolation**: All cross-domain calls must resolve via `@carbroz/domain-<name>` public barrels (`dist/public/index.js`).
- **Zero Deep Imports**: Importing private internal files (`../../domains/foo/src/domain/...`) is strictly prohibited.
- **Zero Schema Mutations**: All domain persistence maps cleanly to the baseline `prisma/schema.prisma`.
