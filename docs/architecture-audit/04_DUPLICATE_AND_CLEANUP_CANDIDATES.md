# 04 — Duplicate & Cleanup Candidates Report

## 1. Classification of Workspace Files & Content

All items audited across the repository are categorized according to safety guidelines:

| Item / File Path | Issue / Reason | Classification | Proposed Action |
|---|---|---|---|
| Domain Entities at Root (`packages/common/src/domain/*.ts`) | 30 entity files sit at root of `domain/` while others sit in subdirectories | **NEEDS REFACTOR FIRST** | Group into domain subfolders (`domain/auth/`, `domain/customer/`, `domain/catalog/`, `domain/partner/`) |
| Repositories at Root (`packages/common/src/domain/repositories/*.ts`) | Repository contracts split between `domain/repositories/` and domain subfolders | **NEEDS REFACTOR FIRST** | Co-locate repository interfaces inside their domain subfolders (`domain/auth/repositories/`, `domain/booking/repositories/`) |
| Admin Routes & Controllers Split | `modules/admin/` holds partner/kyc/catalog routes while others (`corporate`, `dispute`) hold `AdminCorporateController`, `AdminDisputeController` inside feature modules | **NEEDS REFACTOR FIRST** | Standardize admin delivery endpoints to feature modules under `modules/<feature>/controllers/Admin<Feature>Controller.ts` |
| Duplicate DTO schema imports | Schema definitions split between `.dto.ts` and `.validator.ts` in auth module | **SAFE TO MERGE** | Consolidate auth DTOs into `modules/auth/dtos/auth.dto.ts` |
| Compiled build artifacts (`dist/`) | Generated JS and `.d.ts` files in git workspace | **DO NOT DELETE** | Keep tracked in monorepo per existing pnpm build configuration |
| Database Prisma Schema | Single `schema.prisma` file containing all models | **DO NOT DELETE** | Keep single Prisma schema file to preserve Prisma migration stability |

---

## 2. Unnecessary Registries & Dead Code Verification
- **`ui-sdk` Registries**: Audit confirmed that `ActionRegistry`, `ValidatorRegistry`, and `AnalyticsRegistry` classes do **NOT** exist in `@carbroz/ui-sdk`. Planning references to them were removed in Phase 23 refinement.
- **Unused Fallbacks**: No dead or unreachable fallback builders found in `apps/backend-api`.
