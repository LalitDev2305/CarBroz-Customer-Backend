# Release Notes — Phase 14 & SDUI Hierarchy Separation

---

## Highlights

- **Domain Isolation**: Implemented Clean Architecture domain entity separation for all 4 SDUI node levels (`SduiComponentEntity`, `SduiSubcomponentEntity`, `SduiChildEntity`, `SduiChildrenDataEntity`).
- **Explicit Admin APIs**: Exposed dedicated registration endpoints (`/components`, `/subcomponents`, `/children`, `/children-data`).
- **Unified Physical Table**: Retained single physical `SduiComponentRegistry` table in Prisma to avoid database bloat.
- **Phase 14 Versioning & Publishing**: Fully compatible with draft, publish, archive, and rollback version management at Screen layout level.
