# 01 — Complete Repository Inventory

---

## 1. Directory & Package Inventory Matrix

| Folder / Package Path | Category | Core Responsibility | Placement Status | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `apps/backend-api` | Application App | Monolithic API server hosting controllers, routes, use cases, DI container. | CORRECT | **KEEP** |
| `packages/common` | Core Domain & App | Shared domain entities, repository contracts, exceptions, base interfaces. | CORRECT | **KEEP** (Cleanly structured with `domain/sdui/`) |
| `packages/database` | Infrastructure | Prisma Client, Prisma schema, migrations, Prisma repository implementations. | CORRECT | **KEEP** |
| `packages/ui-sdk` | UI SDK | Kotlin/TS SDUI screen builders, component factories, serializers. | CORRECT | **KEEP** |
| `packages/config` | Core Service | Environment config loading and validation via Zod. | CORRECT | **KEEP** |
| `packages/feature-flags` | Infrastructure | Feature flag provider abstraction & evaluator. | CORRECT | **KEEP** |
| `packages/logger` | Infrastructure | Fastify/Pino logger provider abstraction. | CORRECT | **KEEP** |
| `packages/types` | Shared Types | Global type definitions (`ApiResponse`, `PaginationOptions`). | MISPLACED | **MERGE into `packages/common` & DELETE** |
| `packages/validation` | Shared Utility | Base Zod validation helpers. | MISPLACED | **MERGE into `packages/common` & DELETE** |
| `packages/cache` | Empty Shell | Placeholder for future caching layer. | OBSOLETE | **DELETE package folder** |
| `packages/events` | Empty Shell | Placeholder for domain event bus. | OBSOLETE | **DELETE package folder** |
| `packages/messaging` | Empty Shell | Placeholder for queue/pub-sub. | OBSOLETE | **DELETE package folder** |
| `packages/observability` | Empty Shell | Placeholder for APM/telemetry. | OBSOLETE | **DELETE package folder** |
| `packages/performance` | Empty Shell | Placeholder for performance profiling. | OBSOLETE | **DELETE package folder** |

---

## 2. Root Files Inventory

| Root File | Category | Recommendation | Reason |
| :--- | :--- | :--- | :--- |
| `dashboard.json` | Mock Data | **DELETE** | Temporary root mock JSON |
| `dashboard2.json` | Mock Data | **DELETE** | Temporary root mock JSON |
| `login.json` | Mock Data | **DELETE** | Temporary root mock JSON |
| `lint.log` | Log File | **DELETE** | Leftover lint log output |
| `e-04 bootstrap into phase-07...` | Orphan File | **DELETE** | Leftover temporary bootstrap script/note |
| `prisma/` (Root) | Duplicated Schema | **DELETE** | Duplicate root prisma folder; source is `packages/database/prisma` |
| `generated/` (Root) | Build Artifact | **DELETE** | Unused build artifact folder |
