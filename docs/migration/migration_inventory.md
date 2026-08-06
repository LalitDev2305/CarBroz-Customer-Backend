# Phase P2 Inventory & Analysis

Detailed component inventory for Phase P2.

## 1. Domain Components

- `domains/tracking`: Real-time session state machine, GPS coordinate stream validation, ETA calculation engine.
- `domains/notification`: Multi-channel notification log repository, FCM device token repository, template interpolation engine.

---

## 2. Infrastructure & Provider Interfaces

- `platform/event-bus`: Pub/Sub event dispatcher for `JobStageUpdatedEvent` and `DriverGpsLocationPingedEvent`.
- `platform/queue`: BullMQ `NotificationBatchWorker` for async background push & email retries.
