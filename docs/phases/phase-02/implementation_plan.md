# Phase 2 Implementation Plan
**Infrastructure Foundation & Configuration**

## 1. Phase Overview
This phase solidifies the CarBroz environment and foundational infrastructure to enterprise-grade, Twelve-Factor App compliance. It introduces a highly robust, strictly validated, domain-driven Configuration system using Zod, establishes the baseline Docker orchestration (API, PostgreSQL, Redis), implements advanced health checks (Readiness vs Liveness), prepares for graceful shutdowns, configures baseline security (CORS, Headers), and prepares the Cache and Config Provider abstractions for future phases.

## 2. Goal
To provide a fail-fast, type-safe configuration system across the monorepo, decouple infrastructure parameters from code, and establish a production-ready, K8s-compatible containerized environment that reliably runs the Modular Monolith locally and in CI/CD.

## 3. Scope
- **Configuration System**: Refactor `@carbroz/config` using Zod schemas for App, Database, JWT, Redis, Logging, Providers, CORS, and Rate Limiting. Enforce singleton configuration caching (parse once at startup).
- **Environment**: Scaffold `.env.example`, `.env.development`, and `.env.test`. Implement safe secrets management (preventing secrets from leaking to logs).
- **Docker**: Create a production-ready, multi-stage `Dockerfile` (optimized for size and CI/CD). Enhance `docker-compose.yml` for local API + PostgreSQL + Redis.
- **Providers**: Create interfaces for `ICacheProvider` and `IConfigProvider`.
- **Health Checks**: Implement `/health/liveness` (Fastify availability) and `/health/readiness` (DB & Redis connection status) endpoints.
- **Security & Stability**: Configure dynamic CORS, Security Headers (Helmet), and Graceful Shutdown handling for Kubernetes compatibility.

## 4. Current State Analysis
- **Configuration**: Uses simple `process.env` lookups, lacking strict validation, caching, and domain separation.
- **Docker**: Missing a production multi-stage `Dockerfile`.
- **Redis/Cache**: Missing standard abstractions.
- **Health Checks & Graceful Shutdown**: Non-existent, making the API unsafe for automated orchestrators (K8s/AWS).

## 5. Files to Create
- `apps/backend-api/Dockerfile`
- `docker-compose.yml`
- `.env.example`, `.env.development`, `.env.test`
- `packages/config/src/AppConfig.ts`
- `packages/config/src/DatabaseConfig.ts`
- `packages/config/src/JwtConfig.ts`
- `packages/config/src/RedisConfig.ts`
- `packages/config/src/LoggingConfig.ts`
- `packages/config/src/SecurityConfig.ts` (CORS, Rate Limiting, Headers)
- `packages/config/src/ProvidersConfig.ts`
- `packages/common/src/providers/ICacheProvider.ts`
- `packages/common/src/providers/IConfigProvider.ts`
- `apps/backend-api/src/modules/health/api/health.controller.ts`
- `apps/backend-api/src/modules/health/api/health.routes.ts`
- `apps/backend-api/src/plugins/shutdown.plugin.ts` (Graceful Shutdown)

## 6. Files to Modify
- `packages/config/src/index.ts` (Export Zod schemas, enforce singleton cached evaluation)
- `apps/backend-api/src/app.ts` (Register Health routes, CORS, Helmet, and Shutdown hooks)
- `packages/common/src/index.ts` (Export new provider interfaces)

## 7. Package Changes
- **Add**: `@types/node` and `zod` to `@carbroz/config`.
- **Add**: `close-with-grace` or standard Fastify hooks for graceful shutdown handling in `backend-api`.

## 8. Provider Abstractions
- `ICacheProvider`: Standard `get`, `set`, `delete` methods.
- `IConfigProvider`: Interface to fetch strongly typed configurations.

## 9. Docker Architecture (Multi-stage)
- **Stage 1 (Builder)**: Node.js Alpine base, copies workspace, runs `pnpm install` and `pnpm build`.
- **Stage 2 (Production)**: Minimal Node.js Alpine base, copies only `dist/` and production `node_modules`, runs as non-root user.
- **Compose**: Persistent volumes for PostgreSQL data and Redis data. Dedicated overlay networks.

## 10. Explicit Constraints
- Do NOT implement actual Cache logic or Redis connections (only interfaces and config).
- Do NOT implement actual BullMQ workers.
- Do NOT touch existing business logic or Auth/Prisma modules.

## 11. Missing Additions Included for Enterprise Compliance
- **Graceful Shutdown**: Added to ensure in-flight requests finish before Docker/K8s kills the container.
- **Readiness vs Liveness**: Distinct endpoints. Liveness = API running. Readiness = DB/Redis responsive.
- **CORS & Security Headers**: Dynamically driven by Zod configurations (SecurityConfig).
- **Configuration Caching**: Config is evaluated precisely once at startup to prevent redundant `process.env` parsing.

## 12. Verification Plan
- `pnpm lint`, `pnpm build`, `pnpm test` must pass.
- `docker compose config` must validate successfully.
- Assert Liveness/Readiness endpoints return 200/503 correctly based on infra state.

## 13. Deliverables
- `docs/phases/phase-02/implementation_plan.md`
- `docs/phases/phase-02/walkthrough.md`
- `docs/phases/phase-02/release_notes.md`
- `docs/reviews/PHASE_2_ARCHITECTURE_REVIEW.md`

## User Review Required
> [!IMPORTANT]
> The configuration refactor will strictly fail the application if ANY required `.env` variable is missing or malformed. Ensure your local `.env` aligns with the new `.env.example` before running the API locally.
