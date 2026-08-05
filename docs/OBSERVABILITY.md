# Enterprise Observability & Tracing Specification

Logging, metrics, tracing, and health check standards for operational monitoring.

## 1. Structured Logging (`@carbroz/logger`)

- **JSON Format**: High-performance Pino logger emitting structured JSON logs.
- **Correlation ID Propagation**: `x-correlation-id` attached to every request via Fastify middleware and propagated across AsyncLocalStorage contexts down to Prisma queries and background BullMQ workers.

---

## 2. Health & Readiness Probes

- **`/health/liveness`**: Returns `200 OK` if node process is running.
- **`/health/readiness`**: Checks active connections to PostgreSQL (Prisma), Redis, and MinIO storage before returning `200 OK`.
