# Workspace Dependency Graph & Directionality Specification

Visual representation and architectural rules governing dependencies.

## 1. Architectural Pillar Graph

```mermaid
graph TD
    Apps["Apps Layer<br/>(apps/backend-api)"] --> CoreDomains["Core Domains<br/>(@carbroz/domain-identity, @carbroz/domain-customer-profile, etc.)"]
    Apps --> TxDomains["Transactional Domains<br/>(@carbroz/domain-booking, @carbroz/domain-payment, etc.)"]
    Apps --> EngDomains["Engagement Domains<br/>(@carbroz/domain-notification, @carbroz/domain-sdui-registry, etc.)"]
    Apps --> Platform["Platform Layer<br/>(@carbroz/database, @carbroz/cache, @carbroz/queue, etc.)"]
    Apps --> Shared["Shared Layer<br/>(@carbroz/shared-kernel, @carbroz/shared-ui-sdk)"]

    CoreDomains --> Platform
    CoreDomains --> Shared
    TxDomains --> Platform
    TxDomains --> Shared
    EngDomains --> Platform
    EngDomains --> Shared

    Platform --> Shared
```

---

## 2. Dependency Direction Rules

- Allowed: `Apps` -> `Domains`, `Platform`, `Shared`
- Allowed: `Domains` -> `Platform`, `Shared`
- Allowed: `Platform` -> `Shared`
- Forbidden: `Shared` -> `Platform`, `Domains`, `Apps`
- Forbidden: `Platform` -> `Domains`, `Apps`
- Forbidden: `Domains` -> `Apps`
