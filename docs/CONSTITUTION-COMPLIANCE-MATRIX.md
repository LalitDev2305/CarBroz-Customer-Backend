# CarBroz Backend V3 — Constitution Compliance Matrix

**Authority:** `docs/MASTER-BACKEND-CONSTITUTION.md` only  
**Purpose:** literal Constitution convergence map and permanent workstream evidence  
**Rule:** This document records evidence/status; it does not redefine architecture. If it conflicts with the Master Constitution, the Master Constitution wins.

## Status vocabulary

- **PASS** — current checked-in evidence and required executable enforcement satisfy the rule family for its present scope.
- **TRANSITIONAL** — canonical direction exists but semantic convergence or proof remains unfinished.
- **GAP** — current evidence contradicts or does not yet satisfy a mandatory Constitution rule.
- **DEFERRED-CAPABILITY** — optional/not-yet-implemented capability; no empty ceremonial folder is required.
- **REVIEW** — advisory/applicability-dependent rule that must be dispositioned before freeze.

## Workstream model

The bootstrap defines exactly four project milestones. CW1-CW6 are compliance workstreams inside those milestones, not replacement project phases.

CW1, CW2 and CW3 are closed and protected by permanent read-only gates. **CW4 is the first unfinished workstream.** A green closed-workstream gate does not promote CW4-CW6 rows to PASS.

## Current Constitution matrix

| Constitution | Requirement | Current classification | Evidence / required convergence |
|---|---|---|---|
| §1–2 | Master Constitution sole authority; modular monolith + DDD + Clean/Hexagonal | PASS | Bootstrap/freeze/ledger point to the Master Constitution only; permanent validation derives topology/dependency rules from it. |
| §3–4 | Partner, Customer, Admin first-class and isolated | PASS | API has separate `surfaces/partner`, `surfaces/customer`, `surfaces/admin`; permanent gates reject cross-surface internals. |
| §5–7 | Exact canonical roots; no `packages/shared/libs/common`; workspace only five source globs | PASS | CW2 verifier requires exact 23 workspaces and exact globs `apps/*`, `domains/*`, `sdui/*`, `platform/*`, `foundation/*`. |
| §8–9 | `apps/api` composition/transport only; exact `bootstrap/surfaces/system/transport`; three API families | PASS | Legacy API roots/business ownership are absent and permanently rejected. |
| §10 | Identity owns auth, OTP, sessions, token policy, RBAC | GAP | Ownership is canonical; production OTP/session behavior remains a §41/CW5 blocker. |
| §11 | Partner owns profile/org/member/KYC/training/capability/availability/lifecycle | PASS | CW3 verified one Partner/Profile/KYC authority; root authorization/orchestration delegates to the canonical KYC submodule rather than duplicating it. |
| §12 | Customer owns profile/preferences/address/garage/account state | DEFERRED-CAPABILITY | Implemented Customer ownership is canonical; unimplemented capabilities do not require ceremonial folders. |
| §13 | Catalog + Pricing one context, internally separated | PASS | Canonical context exists; settlement remains outside Catalog-Pricing. |
| §14–15 | Booking owns booking state; Operations owns capacity/assignment/dispatch/tracking/execution | PASS | CW3 verified Booking state ownership and Operations assignment/dispatch/maps/tracking ownership; Booking no longer declares Partner solely for dispatch. Concurrency semantics remain §40/CW4-CW5 work. |
| §16 | Financials owns payment/invoice/refund/payout/commission/ledger/settlement | PASS | CW3 removed Enterprise corporate accounting authority and converged invoice/payment accounting to Financials. Financial invariants remain separately gated by §39. |
| §17–20 | Communications, Engagement, Configuration, Dispute ownership | PASS | Canonical owners are unique and CW3 public-boundary/dependency checks found no competing authority. Later behavioral hardening is governed by other sections. |
| §21 | Enterprise owns corporate account/member/fleet/eligibility only; accounting remains Financials | PASS | Corporate invoice/payment-accounting artifacts no longer live under Enterprise authority; stale Financials/Booking/Communications dependency declarations were removed. |
| §22 | Audit business/security records distinct from technical logging | PASS | Audit and Observability remain separate owners. Audit console logging is a CW5 observability defect, not ownership duplication. |
| §23 | Real-responsibility internal layers; no ceremonial folders | TRANSITIONAL | Physical/ownership convergence is complete; CW4 must finish semantic application-vs-domain responsibility where evidence requires it. |
| §24–32 | Exactly one UI SDK + Registry; canonical hierarchy; scope/version immutability | TRANSITIONAL | Exactly two canonical SDUI workspaces exist and CW3 rejects product coupling; complete version/immutability behavior still requires later proof. |
| §33 | One Foundation kernel; universal primitives only | PASS | One Foundation kernel exists, upward dependencies are rejected, and CW3 found no competing business authority there. |
| §34 | Platform owns technology only | PASS | Platform remains technical infrastructure; CW3 dependency/public-boundary verification found no competing domain authority. Production provider/observability hardening remains CW5. |
| §35–36 | Inward dependency law + public boundaries | PASS | CW3 permanently rejects deep cross-domain/internal coupling and stale declared dependency direction for the closed ownership graph. |
| §37 | Real transaction propagation + PostgreSQL rollback proof | GAP | CW4/CW5 must provide executable rollback/transaction propagation evidence. |
| §38 | Versioned events/outbox SHOULD for cross-domain side effects | REVIEW | Evaluate where implemented critical side effects require it; not a universal mandatory mechanism. |
| §39 | Minor-unit Money, immutable quotation snapshots, ledger/idempotency/double-entry invariants | GAP | Must be proven for implemented financial workflows after ownership convergence. |
| §40 | Booking/Operations concurrency, explicit transitions, Clock | GAP | Requires semantic/concurrency proof for implemented critical flows. |
| §41 | Production OTP/session security | GAP | `domains/identity/application/AuthUseCases.ts` remains a known CW5 full-gate blocker. |
| §42 | Transport auth separate from resource ownership; public IDs externally | GAP | Must be verified per externally exposed resource. |
| §43 | Typed expected errors; transport mapping; no internal leakage | TRANSITIONAL | Error architecture exists but endpoint/error proof is incomplete. |
| §44 | Env/secrets separate from business config; no import-time exit; reject unsafe prod defaults | GAP | Requires production bootstrap/config proof. |
| §45 | Metadata-first observability + PII redaction + no silent provider failures | GAP | Direct console logging remains in `apps/api/src/bootstrap/config/runtime-config.ts` and `domains/audit/application/AuditLogService.ts`; complete PII/provider proof remains. |
| §46–48 | File-level migration classification + frozen migration order | PASS | CW2 materialized canonical checked-in source; historical migration scripts are forensic only unless explicitly proven active. |
| §49–50 | Required test layers + literal 100/100/100/100 executable coverage + SDUI matrix | GAP | Test layers exist; final strict coverage and complete SDUI behavioral matrix remain CW6 proof. |
| §51 | Architecture checks reject listed drift classes | PASS | CW2 physical verifier, CW1/CW2 Constitution regression gate and CW3 boundary gate are read-only and wired into CI/closeout; CW3 also runs in `freeze:preflight`. Full mode remains fail-closed for later blockers. |
| §52 | No tracked generated/build/coverage output | PASS | Permanent validation scans tracked files and exact-SHA CI/closeout end with clean-tree proof. |
| §53 | Feature gate after freeze | PASS | Becomes mandatory for feature implementation after architecture freeze. |
| §54 | All final freeze criteria simultaneously true | GAP | CW4-CW6, full gate and 100/100/100/100 are not yet complete. |
| §55–56 | Partner-first delivery after freeze; shared contexts remain neutral | PASS | Product feature implementation remains behind architecture freeze. |

## Permanent gate model

### CW2 physical verifier

`node tools/architecture-closeout.mjs`

Protects exact checked-in physical topology and immutable CI expectations.

### CW1/CW2 Constitution regression gate

`node tools/architecture-closeout-constitution-gate.mjs --regression`

Protects already-closed Constitution invariants and permits only the exact current later-workstream blocker baseline. It is not a waiver and is not the final Constitution gate.

### CW3 bounded-context/dependency gate

`node tools/cw3-boundary-gate.mjs`

Protects Enterprise/Financials, Booking/Operations, Partner/KYC, cross-domain public-boundary/dependency law, and API/SDUI isolation. It is read-only and runs before/after validation in normal CI, architecture closeout and freeze preflight.

### Full Constitution gate

`node tools/architecture-closeout-constitution-gate.mjs`

Permits no later-workstream exceptions. It is the authoritative executable diagnostic for CW4-CW6 convergence and must pass for production freeze.

## Recorded later-workstream regression baseline

The former CW3 Enterprise-accounting exception set has been removed. The remaining exception set is intentionally narrow and belongs only to CW5.

### CW5 — Identity security

- `domains/identity/application/AuthUseCases.ts`

### CW5 — observability

- `apps/api/src/bootstrap/config/runtime-config.ts`
- `domains/audit/application/AuditLogService.ts`

Adding another exception is forbidden as an ordinary implementation shortcut. When an existing blocker is fixed, its exception must be removed in the same coherent change.

## Workstream queue

### CW1 — COMPLETE

- §§1–56 mapped and governing documentation reconciled;
- permanent verifier is read-only;
- regression/full gate responsibilities are separated.

### CW2 — COMPLETE

- canonical workspace/API topology is checked in;
- transitional authorities are absent;
- immutable installation and clean-tree proof are permanent requirements.

### CW3 — COMPLETE

- Enterprise accounting authority converged to Financials;
- Booking vs Operations ownership verified and dependency direction corrected;
- Partner/Profile/KYC duplicate-authority audit completed;
- duplicate Operations tracking repository contract collapsed to one owner;
- stale workspace manifest/lockfile edges removed;
- cross-domain public boundaries and API/SDUI neutrality permanently enforced;
- dedicated CW3 gate wired into CI, architecture closeout and freeze preflight.

### CW4 — ACTIVE / FIRST UNFINISHED

1. Application orchestrates; domain owns invariants/state transitions.
2. Mandatory `ExecutionContext.actor` everywhere applicable after transport conversion.
3. Clock/ID/transaction/idempotency contracts where required.
4. Remove dead/impossible branches rather than fabricating impossible tests.
5. Prove transaction propagation and critical concurrency behavior where CW4 owns the semantic contract.

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

## CW3 closeout evidence

Primary executable closeout commit `7d9a7f92759631950c8e61d4f9d4df278d68a11c` passed:

- **CarBroz Backend CI #1389 / run `34032196287` — SUCCESS**;
- **Backend Architecture Closeout Verifier #132 / run `34032196284` — SUCCESS**.

The preceding implementation boundary `16c4d8f221e36660507b0bd4d459c1d88fab7a09` also passed CI #1388 / run `34031947387` and Architecture Closeout #131 / run `34031947452`.

Independent full-gate diagnostic run `34032010465` proved that every remaining full-gate failure is confined to the three recorded CW5 files and that no CW3 ownership/dependency blocker remains.
