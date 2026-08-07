---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 01 Architecture Blueprint

## System Architecture
The platform is built as a **Modular Monolith**, maximizing development speed while preserving strict boundaries for future extraction into Microservices.

## Bounded Contexts
- Identity & Access Management (IAM)
- Catalog & Pricing
- Dynamic UI (SDUI) Service
- Booking & Order Engine
- Partner Availability & Geospatial Engine
- Financial & Ledger Engine
- Communication & Notification

## Architectural Patterns
- **Clean Architecture & DDD**: Core business rules and entities reside in the center. Infrastructure and UI exist at the outermost layer. 
- **Dependency Injection (DI)**: Components are loosely coupled and dependencies are resolved via a DI container.
- **Provider Pattern**: Abstracting external systems (DB, Queues, Payment Gateways) behind strict interfaces (e.g., `IMapsProvider`).
- **Repository Pattern**: Abstracting database persistence. Controllers never query the database directly.
- **Strategy & Factory Patterns**: Utilized heavily in dynamic engines (Pricing, Dispatch, Routing).
- **Builder Pattern**: Exclusively used for generating Dynamic UI JSON structures.

## Scaling Strategy
- **Event-Driven Resilience**: Leveraging message queues (BullMQ/Kafka) for asynchronous processing to prevent request blocking.
- **Stateless APIs**: Scaling HTTP nodes horizontally with ease.
- **Caching**: Multi-tiered caching in Redis (Read-through for catalog, Session caching, Geo-hashing for locations).

## Future Migration Strategy
- **Current architecture**: Modular Monolith.
- **Future architecture**: Microservices.
- **Migration Strategy**: Migration must happen strictly through the Provider abstraction. Any structural change to backend infrastructure (e.g., migrating from PostgreSQL to AWS Aurora, MinIO to S3, BullMQ to Kafka) is handled purely at the Provider layer. The internal UseCases and domain logic are entirely agnostic to the infrastructure, meaning ZERO business logic changes are required during an infrastructure migration or when extracting a module into a microservice.
