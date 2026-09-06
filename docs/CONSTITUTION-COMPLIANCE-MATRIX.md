# CarBroz Backend V3 — Constitution Compliance Matrix

**Authority:** `docs/MASTER-BACKEND-CONSTITUTION.md` only  
**Purpose:** literal Constitution convergence map and permanent workstream evidence  
**Rule:** This document records evidence/status; it does not redefine architecture. If it conflicts with the Master Constitution, the Master Constitution wins.

## Status vocabulary

- **PASS** — current checked-in evidence and required executable enforcement satisfy the rule family for its present scope.
- **TRANSITIONAL** — canonical direction exists but semantic/ownership convergence or proof remains unfinished.
- **GAP** — current evidence contradicts or does not yet satisfy a mandatory Constitution rule.
- **DEFERRED-CAPABILITY** — optional/not-yet-implemented capability; no empty ceremonial folder is required.
- **REVIEW** — advisory/applicability-dependent rule that must be dispositioned before freeze.

## Workstream model

The bootstrap defines exactly four project milestones. CW1-CW6 are compliance workstreams inside those milestones, not replacement project phases.

CW1 and CW2 are closed. Their invariants are protected by read-only permanent gates. CW3 is the first unfinished workstream. A green CW1/CW2 regression gate does not promote later rows to PASS.

## Current Constitution matrix

| Constitution | Requirement | Current classification | Evidence / required convergence |
|---|---|---|---|
| §1–2 | Master Constitution sole authority; modular monolith + DDD + Clean/Hexagonal | PASS | Bootstrap/freeze/ledger point to the Master Constitution only; permanent validation derives topology/dependency rules from it. |
| §3–4 | Partner, Customer, Admin first-class and isolated | PASS | Checked-in API has separate `surfaces/partner`, `surfaces/customer`, `surfaces/admin`; permanent gate rejects cross-surface internals. |
| §5–7 | Exact canonical roots; no `packages/shared/libs/common`; workspace only five source globs | PASS | CW2 verifier requires exact 23 workspaces and exact globs `apps/*`, `domains/*`, `sdui/*`, `platform/*`, `foundation/*`; transitional roots are absent. |
| §8–9 | `apps/api` composition/transport only; exact `bootstrap/surfaces/system/transport`; three API families | PASS | Checked-in API root is exact; legacy API roots/entry points and API use-case/Prisma ownership are permanently rejected. |
| §10 | Identity owns auth, OTP, sessions, token policy, RBAC | GAP | Ownership is canonical, but production OTP/token behavior remains a §41/CW5 blocker. |
| §11 | Partner owns profile/org/member/KYC/training/capability/availability/lifecycle | TRANSITIONAL | Canonical Partner workspace exists; CW3 must complete duplicate/public-boundary ownership audit. |
| §12 | Customer owns profile/preferences/address/garage/account state | DEFERRED-CAPABILITY | Implemented Customer ownership is canonical; unimplemented product capabilities do not justify empty folders. |
| §13 | Catalog + Pricing one context, internally separated | PASS | Canonical context exists; settlement remains outside Catalog-Pricing. |
| §14–15 | Booking owns booking state; Operations owns capacity/assignment/dispatch/tracking/execution | TRANSITIONAL | Permanent gate rejects obvious Booking dispatch/tracking/capacity residue; CW3 still verifies complete public ownership and consumers. |
| §16 | Financials owns payment/invoice/refund/payout/commission/ledger/settlement | GAP | Four corporate invoice/payment-accounting artifacts still live under Enterprise and must converge to Financials. |
| §17–20 | Communications, Engagement, Configuration, Dispute ownership | TRANSITIONAL | Canonical workspaces exist; complete dependency/config separation proof remains later-workstream work. |
| §21 | Enterprise owns corporate account/member/fleet/eligibility only; accounting remains Financials | GAP | `CorporateInvoice`, `CorporateInvoiceLine`, `GenerateCorporateInvoiceUseCase`, `ReconcileCorporatePaymentUseCase` remain under Enterprise. |
| §22 | Audit business/security records distinct from technical logging | PASS | Audit and Observability are separate owners. Audit failure logging still has a CW5 observability-quality blocker, not ownership duplication. |
| §23 | Real-responsibility internal layers; no ceremonial folders | TRANSITIONAL | Physical workspace convergence is complete; internal semantic normalization occurs only where CW3/CW4 evidence proves real responsibility. |
| §24–32 | Exactly one UI SDK + Registry; canonical hierarchy; scope/version immutability | TRANSITIONAL | Exactly two canonical SDUI workspaces exist and regression gates reject legacy vocabulary/product coupling; complete version/immutability behavior still requires proof. |
| §33 | One Foundation kernel; universal primitives only | TRANSITIONAL | One kernel exists and upward dependencies are rejected; CW3 must finish semantic ownership audit. |
| §34 | Platform owns technology only | TRANSITIONAL | Platform shape is canonical; later work verifies no business policy/repository authority leaks into it. |
| §35–36 | Inward dependency law + public boundaries | TRANSITIONAL | Permanent gate rejects API/platform/vendor leakage and deep cross-domain imports; CW3 completes capability-by-capability public-boundary convergence. |
| §37 | Real transaction propagation + PostgreSQL rollback proof | GAP | CW4/CW5 must provide executable rollback/transaction propagation evidence. |
| §38 | Versioned events/outbox SHOULD for cross-domain side effects | REVIEW | Evaluate only where implemented critical side effects require it; not a universal mandatory mechanism. |
| §39 | Minor-unit Money, immutable quotation snapshots, ledger/idempotency/double-entry invariants | GAP | Must be proven for implemented financial workflows. |
| §40 | Booking/Operations concurrency, explicit transitions, Clock | GAP | Requires semantic/concurrency proof for implemented critical flows. |
| §41 | Production OTP/session security | GAP | `domains/identity/application/AuthUseCases.ts` still contains mock/hardcoded OTP and weak timestamp-derived token behavior. |
| §42 | Transport auth separate from resource ownership; public IDs externally | GAP | Must be verified per externally exposed resource. |
| §43 | Typed expected errors; transport mapping; no internal leakage | TRANSITIONAL | Error architecture exists but endpoint/error proof is incomplete. |
| §44 | Env/secrets separate from business config; no import-time exit; reject unsafe prod defaults | GAP | Requires production bootstrap/config proof. |
| §45 | Metadata-first observability + PII redaction + no silent provider failures | GAP | Direct console logging remains in `apps/api/src/bootstrap/config/runtime-config.ts` and `domains/audit/application/AuditLogService.ts`; complete PII/provider proof remains. |
| §46–48 | File-level migration classification + frozen migration order | PASS | CW2 materialized canonical checked-in source. Historical migration scripts are forensic evidence only unless explicitly proven active. |
| §49–50 | Required test layers + literal 100/100/100/100 executable coverage + SDUI matrix | GAP | Test layers exist; final strict coverage remains below literal target and complete SDUI matrix remains part of freeze proof. |
| §51 | Architecture checks reject listed drift classes | PASS | Read-only CW1/CW2 regression gate is wired into normal CI, closeout and preflight; default/full gate retains fail-closed later-workstream rules. |
| §52 | No tracked generated/build/coverage output | PASS | Permanent gate scans tracked files; exact-SHA CI/closeout end with clean-tree proof. |
| §53 | Feature gate after freeze | PASS | Becomes mandatory for feature implementation after architecture freeze. |
| §54 | All final freeze criteria simultaneously true | GAP | Full gate, later workstreams and 100/100/100/100 are not yet complete. |
| §55–56 | Partner-first delivery after freeze; shared contexts remain neutral | PASS | Product feature implementation remains behind architecture freeze. |

## Permanent gate model

### CW1/CW2 regression gate

`node tools/architecture-closeout-constitution-gate.mjs --regression`

This mode protects closed invariants and permits only the exact current later-workstream blocker baseline. It fails if new blocker files appear. It is not a waiver and is not the final Constitution gate.

### Full Constitution gate

`node tools/architecture-closeout-constitution-gate.mjs`

This mode permits no later-workstream exceptions. It is the authoritative executable diagnostic for CW3-CW6 convergence and must pass for production freeze.

## Recorded later-workstream regression baseline

The regression exception set is intentionally narrow and must shrink as blockers are fixed.

### CW3 — Enterprise → Financials accounting ownership

- `domains/enterprise/domain/CorporateInvoice.ts`
- `domains/enterprise/domain/CorporateInvoiceLine.ts`
- `domains/enterprise/use-cases/GenerateCorporateInvoiceUseCase.ts`
- `domains/enterprise/use-cases/ReconcileCorporatePaymentUseCase.ts`

### CW5 — Identity security

- `domains/identity/application/AuthUseCases.ts`

### CW5 — observability

- `apps/api/src/bootstrap/config/runtime-config.ts`
- `domains/audit/application/AuditLogService.ts`

Adding another exception is forbidden as an ordinary implementation shortcut. When an existing blocker is fixed, its exception is removed in the same coherent change.

## Workstream queue

### CW1 — COMPLETE

- §§1–56 mapped and governing documentation reconciled.
- high-risk architecture rules encoded.
- permanent gate converted to read-only verification.
- regression/full gate responsibilities separated.
- exact workspace/API enforcement is fail-closed.

### CW2 — COMPLETE

- transitional top-level/workspace roots removed;
- canonical API `bootstrap/surfaces/system/transport` materialized in checked-in source;
- legacy API business/module/container/provider/context/root transport authorities removed;
- every canonical workspace documented;
- permanent physical verifier is exact and read-only;
- immutable installation and clean-tree proof are permanent CI requirements.

### CW3 — ACTIVE / FIRST UNFINISHED

1. Move corporate invoice/payment-accounting responsibility from Enterprise to Financials without duplicate authority.
2. Verify Booking vs Operations ownership for slot/capacity/assignment/dispatch/tracking/execution.
3. Verify Partner/profile/KYC consolidation and eliminate duplicate authority.
4. Enforce cross-domain access through public contracts/application services/events only.
5. Verify product-surface isolation and SDUI product neutrality end-to-end.

### CW4 — PENDING

1. Application orchestrates; domain owns invariants/state transitions.
2. Mandatory `ExecutionContext.actor` everywhere applicable after transport conversion.
3. Clock/ID/transaction/idempotency contracts where required.
4. Remove dead/impossible branches rather than fabricating impossible tests.
5. Prove transaction propagation and critical concurrency behavior.

### CW5 — PENDING

1. Replace mock/development OTP behavior with secure challenge/provider lifecycle.
2. Implement/prove cryptographically strong refresh-token lifecycle and reuse detection.
3. Complete resource ownership authorization audit.
4. Prove config/secrets production rejection rules.
5. Remove direct console blockers; prove PII redaction and provider-failure observability.
6. Prove implemented financial invariants/idempotency/double-entry requirements.

### CW6 — PENDING

1. Every mandatory row PASS; every REVIEW row dispositioned.
2. Full Constitution gate green with no regression-baseline exceptions remaining.
3. Architecture/contract/integration/E2E/security tests green.
4. Prisma validate/generate/migrate green.
5. Build + lint + complete tests green.
6. Production coverage exactly 100/100/100/100.
7. Clean-tree/non-mutating proof green.
8. Exact final SHA CI/freeze evidence recorded.

## CW1/CW2 reconciliation evidence

Executable reconciliation commit `37cb1c1ff8fb025d94d5f9107a6abae0639ff904` passed:

- CarBroz Backend CI #1383 / run `34027645386`;
- Backend Architecture Closeout Verifier #126 / run `34027645311`.

Both passed exact CW2 topology, CW1/CW2 regression Constitution gate before/after validation, Prisma validation/generation/migrations, build, lint, full Vitest and clean-tree verification.
