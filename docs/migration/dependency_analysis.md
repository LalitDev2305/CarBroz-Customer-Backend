# Core Business Domains Dependency Analysis — Milestone 2

Detailed dependency mapping and coupling graph for Milestone 2 Core Domains.

## Domain Dependency Graph

```mermaid
graph TD
    subgraph Delivery Layer [apps/backend-api]
        Controllers[HTTP Controllers / Routes]
    end

    subgraph Core Domains [domains/*]
        Identity[domains/identity]
        CustomerProfile[domains/customer-profile]
        Address[domains/address]
        PartnerProfile[domains/partner-profile]
        PartnerKYC[domains/partner-kyc]
        Catalog[domains/catalog]
        Pricing[domains/pricing]
        Garage[domains/garage]
    end

    subgraph Technical Platform [platform/*]
        DB[platform/database]
        Cache[platform/cache]
        EventBus[platform/event-bus]
        Storage[platform/storage]
    end

    subgraph Shared Kernel [shared/*]
        Kernel[shared/kernel]
        UISDK[shared/ui-sdk]
    end

    Controllers --> Identity
    Controllers --> CustomerProfile
    Controllers --> Address
    Controllers --> PartnerProfile
    Controllers --> PartnerKYC
    Controllers --> Catalog
    Controllers --> Pricing
    Controllers --> Garage

    Identity --> DB
    Identity --> Kernel
    Identity --> UISDK

    CustomerProfile --> DB
    CustomerProfile --> Kernel

    Address --> DB
    Address --> Kernel

    PartnerProfile --> DB
    PartnerProfile --> Kernel

    PartnerKYC --> DB
    PartnerKYC --> Storage
    PartnerKYC --> Kernel

    Catalog --> DB
    Catalog --> Kernel

    Pricing --> DB
    Pricing --> Kernel

    Garage --> DB
    Garage --> Kernel
```

---

## Inter-Domain Dependency Rules & Directives

1. **Strict Encapsulation**: Domains must import ONLY from another domain's `public/index.ts`. Deep imports into internal folders (`domain/`, `application/`, `infrastructure/`) across domain boundaries are strictly prohibited.
2. **Unidirectional Dependency Flow**:
   - `apps/` → `domains/` → `platform/` → `shared/`
   - Zero upward dependencies from `shared/` or `platform/` to `domains/` or `apps/`.
3. **DI Auto-Registration**: Each domain registers its dependencies (repositories, use cases) via its own Awilix DI module file (e.g. `identity.module.ts`).
