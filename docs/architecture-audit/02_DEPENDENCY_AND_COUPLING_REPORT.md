# 02 — Dependency & Coupling Audit Report

## 1. Package-to-Package Dependency Graph

```
[apps/backend-api]
   ├──> [@carbroz/common]
   ├──> [@carbroz/database]
   ├──> [@carbroz/config]
   ├──> [@carbroz/feature-flags]
   ├──> [@carbroz/logger]
   └──> [@carbroz/ui-sdk]

[@carbroz/database]
   └──> [@carbroz/common]

[@carbroz/ui-sdk]
   └──> (Independent - 0 internal dependencies)

[@carbroz/config]
   └──> (Independent)

[@carbroz/feature-flags]
   └──> [@carbroz/common]

[@carbroz/logger]
   └──> (Independent)
```

---

## 2. Boundary Leakage & Coupling Findings

### Finding 1: Single Giant Kernel (`@carbroz/common`)
- **Issue**: `@carbroz/common` contains domain entities for 20+ distinct business capabilities.
- **Impact**: Any change to any domain model requires re-compiling `@carbroz/common` and rebuilding `@carbroz/database` and `apps/backend-api`.

### Finding 2: Cross-Context Direct Domain Imports
- **Issue**: `Booking.ts` directly imports `CorporateAccount` and `CorporateFleetVehicle` properties. `Invoice` directly references `Booking`.
- **Impact**: Coupling between domain aggregates prevents independent context isolation.

### Finding 3: DI Container Monolith
- **Issue**: `apps/backend-api/src/container/index.ts` registers over 120 services, repositories, use cases, and controllers in a single 580-line file.
- **Impact**: Difficult to navigate and maintain; prone to missing parameter bindings when adding new use cases.

### Finding 4: Type-Only Import Syntax Strictness
- **Issue**: TypeScript `verbatimModuleSyntax` requires explicit `type` keyword for interface imports. Missing `type` keywords trigger language server compilation warnings in tests.
- **Impact**: Developers must remember `type` keywords when importing repository interfaces or DTO types.

---

## 3. Circular Dependency Risk Assessment
- **Package Level**: **0 Circular Dependencies**. Dependency direction is strictly acyclic (`apps/backend-api` -> `@carbroz/database` -> `@carbroz/common`).
- **Module Level**: **Low Risk**. Awilix `.classic()` DI resolution detects circular constructor parameters at application startup.
