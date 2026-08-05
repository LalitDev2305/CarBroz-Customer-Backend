# 06 — Strict Architectural Dependency Rules

## Executive Summary
This document establishes enforceable dependency rules to maintain absolute clean architecture boundaries across the CarBroz monorepo.

---

## 1. Clean Architecture Layer Dependency Matrix

```
       ┌─────────────────────────────────────────────────────────┐
       │                     DELIVERY LAYER                      │
       │    (Fastify Controllers, REST Routes, SDUI Builders)    │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                    APPLICATION LAYER                    │
       │                (Use Cases, Input/Output DTOs)            │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                      DOMAIN LAYER                       │
       │   (Entities, Value Objects, Domain Services, Ports)    │
       └─────────────────────────────────────────────────────────┘
                                    ▲
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       │                   INFRASTRUCTURE LAYER                  │
       │   (Prisma Repositories, Gateway Adapters, External APIs)│
       └─────────────────────────────────────────────────────────┘
```

---

## 2. Mandatory Rules

### Rule 1: Zero Outward Domain Dependencies
- The `domain/` directory inside any feature module must **NEVER** import from `application/`, `infrastructure/`, `delivery/`, Fastify, Prisma, or Awilix.
- Domain logic depends strictly on `@carbroz/common-kernel` and pure TypeScript interfaces.

### Rule 2: Application Layer Isolation
- Use cases in `application/` orchestrate domain entities and repository interfaces (`ports`).
- Application logic must **NEVER** import Fastify request/reply objects or raw database clients.

### Rule 3: Infrastructure Implements Ports
- Infrastructure classes (`PrismaBookingRepository`) sit in `infrastructure/` and implement repository contracts (`IBookingRepository`) defined in `domain/repositories/`.

### Rule 4: UI SDK Absolute Independence
- `@carbroz/ui-sdk` must **NEVER** import from any feature module or backend API service.

### Rule 5: Strict Feature-to-Feature Boundary Protection
- Feature A (`booking`) must **NEVER** reach into the internal implementation files of Feature B (`payment`).
- Cross-feature communication occurs via public feature contracts or domain events.
