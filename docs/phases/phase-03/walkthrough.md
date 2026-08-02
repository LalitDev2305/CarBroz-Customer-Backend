# Phase 3 Walkthrough
**Database Core**

## 1. Prisma Infrastructure
- Defined the Prisma schema in `packages/database/prisma/schema.prisma`.
- Implemented models: `User`, `Role`, `Permission`, `RefreshToken` using standard infrastructure fields (`id`, `publicId`, `createdAt`, `updatedAt`, `deletedAt`).
- Configured Postgres datasource using `DATABASE_URL` via environment mapping in `prisma.config.ts`.

## 2. Abstractions
- **PrismaProvider**: Acts as a singleton wrapper around `PrismaClient` exposing lifecycle methods like `connect()`, `disconnect()`, `health()`, and `transaction()`.
- **DatabaseProvider**: Implemented `IDatabaseProvider` using `PrismaDatabaseProvider` to isolate the application logic from the underlying ORM.
- **TransactionProvider**: Implemented `ITransactionProvider` using `PrismaTransactionProvider` for transactional blocks in the application layer.
- **PrismaRepositoryBase**: Provides a generic strongly-typed abstraction for repositories with methods like `findById`, `findMany`, `create`, `update`, `delete`, and `exists`.

## 3. Dependency Injection
The composition root in `apps/backend-api/src/container/index.ts` was updated to register the new database providers and repository factory into the Awilix container.

## 4. API Hardening
The `/health/readiness` endpoint was upgraded to use the `DatabaseProvider` to verify Prisma connectivity. If the connection drops, it will now return a `503 Service Unavailable`.
