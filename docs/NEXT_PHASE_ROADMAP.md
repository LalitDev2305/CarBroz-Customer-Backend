# Next Architecture & Infrastructure Roadmap

Proposed future architectural milestones building upon the baseline established in Milestones 1–5.

## Milestone 6 — Platform Infrastructure Hardening & Observability
- **M6.1 — Structured Telemetry & Tracing**: Integrate OpenTelemetry tracing across `@carbroz/logger` and Awilix DI middleware.
- **M6.2 — Distributed Caching & Event Bus Resiliency**: Enhance `@carbroz/cache` and `@carbroz/event-bus` with Redis Sentinel / Cluster failover and dead-letter queues.
- **M6.3 — Metrics & Health Probes**: Expose Prometheus `/metrics` endpoints and Kubernetes readiness/liveness probes in `apps/backend-api`.

---

## Milestone 7 — Microservices Modular Extraction & API Gateway
- **M7.1 — Standalone Domain Service Packaging**: Package isolated domains (`@carbroz/domain-identity`, `@carbroz/domain-booking`, `@carbroz/domain-payment`) as independently deployable microservices.
- **M7.2 — Enterprise API Gateway**: Implement a unified API Gateway with rate limiting, OAuth2/JWT token validation, and SDUI layout routing.
