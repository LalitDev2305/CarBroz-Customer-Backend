---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 00 Engineering Standards

> [!CAUTION]
> This document is IMMUTABLE. It acts as the absolute constitution for all backend development.

## Related Documents
- [01 Architecture Blueprint](01_ARCHITECTURE_BLUEPRINT.md)
- [02 Development Workflow](02_DEVELOPMENT_WORKFLOW.md)
- [03 Execution Roadmap](03_EXECUTION_ROADMAP.md)
- [04 Dynamic UI Specification](04_DYNAMIC_UI_SPECIFICATION.md)
- [05 API Standards](05_API_STANDARDS.md)
- [06 Database Standards](06_DATABASE_STANDARDS.md)
- [07 Provider Guidelines](07_PROVIDER_GUIDELINES.md)
- [08 Security Standards](08_SECURITY_STANDARDS.md)
- [09 Branching Strategy](09_BRANCHING_STRATEGY.md)
- [10 Naming Conventions](10_NAMING_CONVENTIONS.md)
- [11 Error Codes](11_ERROR_CODES.md)
- [12 Configuration Matrix](12_CONFIGURATION_MATRIX.md)

## 1. Architecture Principles
- **Clean Architecture & SOLID**: The Domain layer must have zero external dependencies. The Application (UseCase) layer orchestrates domain objects. Infrastructure is strictly isolated.
- **Domain-Driven Design (DDD)**: Systems are bounded by contexts (IAM, Catalog, Booking).
- **Modular Monolith**: Code is packaged into independent modules. Direct cross-module imports of infrastructure are strictly forbidden.
- **Event-Driven & CQRS Ready**: Write operations emit events. Read models can be eventually separated.
- **Microservice Ready**: Every module must be deployable as an independent service in the future.
- **Design Patterns Enforced**:
  - Provider Pattern
  - Repository Pattern
  - Factory Pattern
  - Builder Pattern
  - Strategy Pattern
  - Dependency Injection

## 2. Coding Standards
- **Naming Conventions**: `camelCase` for variables. `PascalCase` for Classes/Interfaces. `UPPER_SNAKE_CASE` for constants.
- **Folder Conventions**: `kebab-case`.
- **File Conventions**: `[name].[type].ts`.
- **Interfaces & DTOs**: Prefix interfaces with `I`. DTOs suffix with `Dto`.
- **Classes**: Suffix appropriately (`Repository`, `UseCase`, `Controller`, `Validator`, `Builder`, `Provider`, `Event`, `Job`).

## 3. Dynamic UI Rules
- **HIERARCHY IS LOCKED**: `screenId`, `templateId`, `templateType`, `template`, `components`, `subcomponents`, `children`, `childrenData`, `theme`.
- **Rule**: Never change the structural hierarchy. Every new screen must follow the same hierarchy.

## 4. API Standards
- **Versioning**: URI Versioning mandatory (`/v1/...`).
- **Pagination & Filtering**: Standardized query params.
- **Headers**: Mandatory `x-correlation-id`, `x-request-id`, `x-idempotency-key`.

## 5. Database Standards
- **Primary Keys**: UUIDv7 strategy enforced.
- **Soft Delete**: Use `deletedAt` for soft deletes.
- **Data Types**: Money stored as BigInt/Integer in lowest denomination. Timezone in `UTC`.
- **Migration Rules**: Strictly use Expand-and-Contract strategy.

## 6. Redis Standards
- **Key Naming**: `{domain}:{entity}:{id}`.
- **TTL**: EVERY key must have an explicit TTL.

## 7. Event Standards
- **Naming**: Past tense (e.g., `PaymentCapturedEvent`).
- **Resilience**: Enforce Idempotency, Retry, and Dead Letter Queues (DLQ).

## 8. Provider Standards
- **Rule**: NO business code can directly access infrastructure.
- Every external dependency requires an Interface, Implementation, Factory, and Configuration.

## 9. Security Standards
- Stateless JWT, Opaque Refresh Tokens, RBAC, MFA, Rate Limiting, Encryption.
- Audit Logging for all financial/admin mutations.

## 10. Logging Standards
- Pino & OpenTelemetry. `trace_id`, `span_id`, and `correlation_id` are mandatory.

## 11. Testing Standards
- Unit, Integration, API tests required. Minimum coverage rules apply.

## 12. Git Standards
- Branch Naming: `{type}/{issue-number}-{brief-desc}`.
- Never commit directly to integration or main.

## 13. Development Workflow
- Follow the permanent 8-step workflow. No implementation before approval.

## 14. Performance & Production Standards
- Caching, Read Replica Ready, Queues, Pagination.
- Dockerized, Health Checks, Monitoring, Metrics, Disaster Recovery, Zero Downtime Migration.

## 15. Future Scalability Guarantee
- Everything must be replaceable through Provider interfaces. Changing infrastructure must require only configuration changes, not business logic changes.

## 16. Definition of Done
A phase is complete only when all of the following conditions are met:
- Implementation completed
- Self Review completed
- Architecture Review completed
- Build passed
- Lint passed
- Tests passed
- Walkthrough generated
- Review generated
- Documentation updated
- Ready for Merge approved
