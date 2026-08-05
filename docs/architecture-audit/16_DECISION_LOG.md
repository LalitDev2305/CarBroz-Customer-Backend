# 16 — Architectural Decision Log (ADR)

---

## Key Decisions

1. **ADR-010: SDUI Bounded Context Placement**
   - **Decision**: Group all SDUI domain entities and repository contracts under `packages/common/src/domain/sdui/`.
   - **Rationale**: Strict Clean Architecture domain isolation.

2. **ADR-011: Public Payload Node Level Omitting**
   - **Decision**: Endpoints (`/components`, `/subcomponents`, `/children`, `/children-data`) infer `nodeLevel` internally.
   - **Rationale**: Eliminates client tampering and guarantees backend node ownership.

3. **ADR-012: Provider Interface Abstraction for Low-Cost MVP**
   - **Decision**: Abstract MinIO/S3, Google Maps/OpenStreetMap, Twilio/Msg91 behind domain provider interfaces.
   - **Rationale**: Ensures zero vendor lock-in and enables low-cost MVP launch.
