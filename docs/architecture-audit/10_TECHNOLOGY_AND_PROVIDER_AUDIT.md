# 10 — Technology and Provider Audit

---

## 1. Provider Abstraction Assessment

| Functional Area | Primary Provider Choice | Abstraction Interface | Monorepo Package Location | Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **Database** | PostgreSQL / Prisma | `IDatabaseProvider` | `@carbroz/database` | Highly modular, clean separation. |
| **Storage** | MinIO / AWS S3 | `IStorageProvider` | `apps/backend-api` | Interface allows zero-cost local S3 or cloud S3. |
| **Maps & Location** | Google Maps API | `IMapsProvider` | `apps/backend-api` | Abstracted; replaceable by OpenStreetMap Nominatim. |
| **Config & Flags** | Zod / In-Memory | `IConfigProvider`, `IFeatureFlagProvider` | `@carbroz/config`, `@carbroz/feature-flags` | Decoupled and tested. |
| **Logger** | Fastify / Pino | `ILoggerProvider` | `@carbroz/logger` | Structural logging abstraction. |
