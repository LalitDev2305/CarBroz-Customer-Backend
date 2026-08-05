# Phase 16 Architectural Decisions & Blockers Log

---

## 1. Architectural Decisions

### ADR-013: Vehicle Ownership Binding
- **Decision**: Bind `Vehicle.customerId` directly to `CustomerProfile.id`.
- **Rationale**: Reuses existing `CustomerProfile` bounded context without introducing duplicate customer identity models.

### ADR-014: Commercial Snapshots as Immutable JSON Document
- **Decision**: Store `snapshotsJson` in `Booking` table containing `basePricePaise`, `addons`, `vehicleMultiplier`, `addressSnapshot`, and `vehicleSnapshot`.
- **Rationale**: Eliminates table sprawl while guaranteeing that historical price calculation remains 100% audit-safe even if catalog prices change later.

### ADR-015: Database Polling Worker for Slot Expiration
- **Decision**: Implement `ExpirePendingBookingsUseCase` as a lightweight polling task.
- **Rationale**: Avoids reintroducing external queue packages (BullMQ/Redis) for simple slot release in MVP.

---

## 2. Blockers
- **None**: All dependencies (`CustomerProfile`, `Address`, `Partner`, `CalculateServicePriceUseCase`, `PrismaTransactionProvider`) exist and are verified.
