# Phase P2 Dependency & Boundary Analysis

Dependency rules for Phase P2 tracking and notification modules.

- `domains/tracking` depends ONLY on `@carbroz/platform-database`, `@carbroz/shared-kernel`.
- `domains/notification` depends ONLY on `@carbroz/platform-database`, `@carbroz/shared-kernel`, `@carbroz/platform-queue`.
- All cross-domain event communications pass asynchronously through `@carbroz/platform-event-bus`. Zero deep imports permitted.
