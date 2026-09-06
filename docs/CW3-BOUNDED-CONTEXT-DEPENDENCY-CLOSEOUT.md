# CW3 — Bounded-Context & Dependency Convergence Closeout

**Status:** COMPLETE  
**Architecture authority:** `docs/MASTER-BACKEND-CONSTITUTION.md`  
**Live continuation:** `docs/PRODUCTION_FREEZE_EXECUTION.md`

CW3 closes business-capability ownership and dependency-boundary convergence on the checked-in canonical repository. It does not claim CW4 semantic contract convergence, CW5 production hardening, CW6 coverage/freeze completion, or a fully green default/full Constitution gate.

## 1. Exit rule

CW3 is complete only when every implemented business capability has one constitutional owner, cross-context access uses public boundaries, transport and SDUI remain neutral, stale workspace edges are removed, and the resulting rules are permanently protected by read-only validation.

Required outcome:

- Enterprise owns corporate account/member/fleet/eligibility policy only; Financials owns invoice/payment accounting;
- Booking owns booking aggregate/state/snapshots while Operations owns assignment/dispatch/tracking/execution concerns;
- Partner/Profile/KYC has one authority with legitimate orchestration rather than duplicate models/repositories;
- cross-domain consumers use package public boundaries rather than deep internals;
- API remains transport/composition only;
- SDUI remains product-neutral with UI SDK + Registry ownership intact;
- declared workspace dependencies match real source dependencies;
- duplicate business/repository authority is absent;
- permanent CI, architecture closeout and freeze preflight enforce CW3 read-only.

## 2. Ownership convergence

### Enterprise ↔ Financials

Corporate invoice/payment-accounting authority was removed from Enterprise and converged into Financials. Enterprise retains corporate account/member/fleet/eligibility responsibilities only.

The former CW3 full-gate blocker paths are no longer present as Enterprise accounting authorities:

- `domains/enterprise/domain/CorporateInvoice.ts`
- `domains/enterprise/domain/CorporateInvoiceLine.ts`
- `domains/enterprise/use-cases/GenerateCorporateInvoiceUseCase.ts`
- `domains/enterprise/use-cases/ReconcileCorporatePaymentUseCase.ts`

Their regression-baseline exceptions were removed in the same convergence.

### Booking ↔ Operations

Booking remains the owner of booking state and booking persistence/application orchestration. Operations owns partner assignment/dispatch, maps/location and live tracking/execution concerns.

The dependency direction is intentionally asymmetric: Operations may consume Booking/Partner public contracts for operational orchestration; Booking does not depend on Partner for dispatch authority.

### Partner / Profile / KYC

Partner, PartnerProfile, membership contracts and repositories have one bounded-context owner under `domains/partner`. The `partner/kyc` submodule is the KYC implementation owner; root Partner application use cases may perform membership/role authorization and delegate to that owner. This is layering, not duplicate authority.

### Operations tracking repository

CW3 found and removed a real duplicate authority: two independent `ITrackingSessionRepository` contracts existed inside Operations tracking. All application use cases, the public boundary and the Prisma adapter now converge on the single canonical contract at:

`domains/operations/tracking/domain/repositories/ITrackingSessionRepository.ts`

## 3. Dependency convergence

The workspace graph was reconciled to current source rather than historical dependencies.

Notable stale edges removed include:

- Enterprise declarations for Booking, Communications and Financials after those source imports disappeared;
- Booking declaration for Partner after partner-assignment authority moved to Operations.

`pnpm-lock.yaml` was regenerated in isolation and the generated importer state was promoted unchanged. Permanent target-branch validation continues to use `pnpm install --frozen-lockfile` only.

## 4. Permanent CW3 verifier

`tools/cw3-boundary-gate.mjs` is the permanent read-only CW3 verifier. It protects five rule families:

1. Enterprise / Financials ownership;
2. Booking / Operations ownership;
3. Partner / Profile / KYC consolidation;
4. cross-domain public-boundary and dependency law;
5. API-surface / SDUI product-neutral isolation.

The gate performs no source rewriting, import migration, generation, commits or deletions.

It is executed:

- before and after validation in `.github/workflows/ci.yml`;
- before and after validation in `.github/workflows/architecture-closeout.yml`;
- before and after validation in `tools/production-freeze/preflight.mjs`.

CW1/CW2 permanent checks remain intact and are not weakened by CW3.

## 5. Exact executable validation evidence

### Implementation boundary

Commit:

`16c4d8f221e36660507b0bd4d459c1d88fab7a09` — `fix(cw3): converge tracking repository adapter contract`

Validated by:

- **CarBroz Backend CI #1388 / run `34031947387` — SUCCESS**;
- **Backend Architecture Closeout Verifier #131 / run `34031947452` — SUCCESS**.

Both passed immutable install, CW2 topology, CW1/CW2 regression verification, CW3 verification, Prisma validate/generate/migrate, monorepo build, lint, full Vitest, post-validation CW1/CW2 + CW3 re-verification, and clean tracked-source proof.

### Permanent preflight enforcement boundary

Commit:

`7d9a7f92759631950c8e61d4f9d4df278d68a11c` — `fix(cw3): enforce boundary gate in freeze preflight`

Validated by:

- **CarBroz Backend CI #1389 / run `34032196287` — SUCCESS**;
- **Backend Architecture Closeout Verifier #132 / run `34032196284` — SUCCESS**.

This exact SHA proved that CW3 enforcement is part of the permanent control plane, not only a one-time closeout check.

## 6. Independent full-Constitution diagnostic

A disposable diagnostic branch ran the default/full Constitution gate against the CW3 implementation lineage without changing the production branch.

Diagnostic run:

- **CW3 Full Constitution Diagnostic / run `34032010465` — SUCCESS as a classification diagnostic**.

The full Constitution gate itself correctly remained non-zero, but the diagnostic proved that every remaining full-gate violation is confined to these known later CW5 files:

- `domains/identity/application/AuthUseCases.ts` — production OTP/session-token security;
- `apps/api/src/bootstrap/config/runtime-config.ts` — direct console logging;
- `domains/audit/application/AuditLogService.ts` — direct console logging.

No Enterprise/Financials, Booking/Operations, Partner/KYC, cross-domain public-boundary, dependency-graph, API-surface or SDUI blocker remained in the full-gate output.

These CW5 blockers are not waived. The default/full Constitution gate remains fail-closed and must become fully green before production freeze.

## 7. What CW3 does not claim

CW3 completion does **not** claim that:

- domain invariants/state transitions are fully converged semantically;
- every application flow has final ExecutionContext/Clock/transaction/idempotency contracts;
- transaction rollback/concurrency behavior is fully proven;
- production OTP/session security is complete;
- config/secrets/PII/provider observability hardening is complete;
- financial double-entry/idempotency invariants are fully proven;
- strict production coverage is 100/100/100/100;
- the full Constitution gate is green;
- the backend is production-frozen.

Those remain CW4-CW6 responsibilities.

## 8. Closeout decision

**CW3 is COMPLETE / CLOSED / PERMANENTLY ENFORCED.**

The first unfinished workstream is **CW4 — Domain/Application Contract Convergence**. CW4 must continue from the current checked-in ownership graph without reopening CW2 physical topology or CW3 bounded-context ownership unless a new executable regression proves a defect.
