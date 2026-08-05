# 05 — Naming Audit

---

## 1. Naming Standards Compliance

| Artifact Category | Monorepo Convention | Compliance Status | Corrective Actions |
| :--- | :--- | :--- | :--- |
| **Packages** | `@carbroz/<package-name>` | **100% Compliant** | Retain active package naming. |
| **Domain Entities** | PascalCase `*Entity` or `Sdui*Entity` | **100% Compliant** | Retain `SduiComponentEntity`, `SduiSubcomponentEntity`, etc. |
| **Use Cases** | Verb + Noun + `UseCase` | **100% Compliant** | Aligned `CreateSduiComponentUseCase`, `CreateSduiSubcomponentUseCase`. |
| **Repository Contracts** | `I*Repository` | **100% Compliant** | `ISduiRegistryRepository`, `IUserRepository`. |
| **Repository Implementations** | `Prisma*Repository` | **100% Compliant** | `PrismaSduiRegistryRepository`. |
| **DTOs & Schemas** | camelCase + `Schema` / PascalCase + `Dto` | **100% Compliant** | `createSduiComponentSchema`, `CreateSduiComponentDto`. |
| **API Endpoints** | Lowercase plural kebab-case | **100% Compliant** | `/components`, `/subcomponents`, `/children`, `/children-data`. |
| **Prisma Tables** | snake_case plural | **100% Compliant** | `sdui_screens`, `sdui_component_registry`, `users`. |
