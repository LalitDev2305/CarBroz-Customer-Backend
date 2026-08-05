# Milestone 4 — Dependency & Coupling Analysis

Dependency directional mapping for Engagement Domains.

```mermaid
graph TD
    Apps["apps/backend-api"] --> Notification["domains/notification"]
    Apps --> Review["domains/review"]
    Apps --> Coupon["domains/coupon"]
    Apps --> Dispute["domains/dispute"]
    Apps --> SduiRegistry["domains/sdui-registry"]
    Apps --> Audit["domains/audit"]
    Apps --> Config["domains/config"]

    Notification --> Platform["platform/*"]
    Review --> Platform
    Coupon --> Platform
    Dispute --> Platform
    SduiRegistry --> Platform
    Audit --> Platform
    Config --> Platform

    Platform --> SharedKernel["shared/kernel"]
    Platform --> SharedUiSdk["shared/ui-sdk"]
```

## Directional Coupling Constraints

1. No domain package in `domains/` may import from `apps/`.
2. Engagement domain packages must interact with each other via public barrels (`@carbroz/domain-notification`, etc.) or domain events.
3. No direct circular imports between `review`, `coupon`, and `dispute`.
