# 13 — Consolidated Production-Focused MVP Roadmap

---

## Consolidated 6-Phase MVP Roadmap

```mermaid
timeline
    title CarBroz Consolidated Production Roadmap
    Phase 15 : Repository Hygiene & Workspace Consolidation : Delete shell packages and root mock artifacts
    Phase 16 : Booking & Order Management : Service scheduling and booking state machine
    Phase 17 : Payment Integration : Payment gateway abstraction and transaction records
    Phase 18 : Real-Time Notifications & Tracking : Partner location updates and push notifications
    Phase 19 : Reviews & Ratings System : Customer service feedback and partner rating calculation
    Phase 20 : Production Hardening & Launch : Security audit, rate limiting, and cloud deployment
```

---

### Phase Summary Table

| Phase | Phase Name | Scope & Objective | Key Deliverables | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 15** | Repository Hygiene & Consolidation | Remove 5 shell packages, root mock files, consolidate `@carbroz/types`. | Monorepo cleanup, streamlined workspace build. | Low |
| **Phase 16** | Booking & Order State Machine | Customer booking creation, scheduling, partner assignment workflow. | Booking domain model, state transition engine, APIs. | Medium |
| **Phase 17** | Payment & Wallet Gateway | Payment processing integration, invoice generation, refunds. | Payment provider abstraction, transaction repository. | Medium |
| **Phase 18** | Real-Time Tracking & Push Notifications | Live location updates, SMS/Push notification alerts. | WebSockets/SSE integration, notification provider. | Medium |
| **Phase 19** | Customer Feedback & Ratings | Ratings, service reviews, partner performance metrics. | Review domain entity, rating calculation engine. | Low |
| **Phase 20** | Production Hardening & Cloud Launch | Security hardening, rate-limiting, CI/CD automated release. | Docker image, deployment scripts, monitoring alerts. | High |
