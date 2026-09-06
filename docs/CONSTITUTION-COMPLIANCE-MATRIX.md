# CarBroz Backend V3 — Constitution Compliance Matrix

**Authority:** `docs/MASTER-BACKEND-CONSTITUTION.md` only  
**Purpose:** compliance workstream 1 gap map for literal Constitution convergence  
**Rule:** This document records evidence/status; it does not redefine architecture. If it conflicts with the Master Constitution, the Master Constitution wins.

## Status vocabulary

- **PASS** — checked-in/final-candidate evidence satisfies the rule.
- **TRANSITIONAL** — deterministic migration exists, but checked-in source is not yet the final physical state.
- **GAP** — current evidence contradicts or does not yet satisfy a mandatory Constitution rule.
- **DEFERRED-CAPABILITY** — optional/not-yet-implemented capability; no empty ceremonial folder is required.
- **REVIEW** — the Constitution uses advisory language (`SHOULD`) or applicability depends on implemented behavior; the item must be evaluated before freeze but is not automatically a universal mandatory gap.

## Workstream 1 finding

The architecture direction is valid, but literal freeze is not yet reached. This workstream establishes the complete rule families and converts high-risk mandatory rules into executable closeout checks. Later workstreams must change the repository to satisfy this matrix; the matrix must never be weakened to make existing code pass.

The repository bootstrap defines exactly four execution milestones and explicitly forbids inventing replacement phases. Therefore the internal P1–P6 labels previously introduced are corrected here to **CW1–CW6 compliance workstreams**. They are subdivisions of the existing M2/M3/M4 work, not new project milestones or competing phases.

| Constitution | Requirement | Current classification | Evidence / required convergence |
|---|---|---|---|
| §1–2 | Master Constitution sole authority; modular monolith + DDD + Clean/Hexagonal | PASS | Constitution and bootstrap/freeze workflow use this file as authority. |
| §3–4 | Partner, Customer, Admin first-class and isolated | TRANSITIONAL | Final candidate has surfaces; closeout enforcement rejects cross-surface imports. |
| §5–7 | Exact canonical roots; no `packages/shared/libs/common`; workspace only five source roots | TRANSITIONAL | Checked-in workspace still contains `packages/*`; final gate now parses declared workspace entries and requires exactly the five canonical roots. |
| §8–9 | `apps/api` composition/transport only; `bootstrap/surfaces/transport/system`; three API families | TRANSITIONAL | Checked-in API still has legacy root structure. Final gate requires canonical bootstrap/surfaces/transport/system, bootstrap entry points, and rejects legacy API roots/entry points. Route-family behavior remains part of API contract verification. |
| §10 | Identity owns auth, OTP, sessions, token policy, RBAC | GAP | Identity ownership exists, but production OTP/token behavior is not yet Constitution-complete (§41). |
| §11 | Partner owns profile/org/member/KYC/training/capability/availability/lifecycle | TRANSITIONAL | Consolidation largely exists; generated/legacy Partner module identities and actor semantics require convergence. |
| §12 | Customer owns profile/preferences/address/garage/account state | DEFERRED-CAPABILITY | Existing implemented Customer ownership is canonical; unimplemented product capabilities do not justify empty folders. |
| §13 | Catalog + Pricing one context, internally separated | PASS | Canonical context exists; financial settlement must remain outside. |
| §14–15 | Booking owns booking state; Operations owns capacity/assignment/dispatch/tracking/execution | TRANSITIONAL | Ownership migration exists; final gate rejects dispatch/tracking/slot/capacity/assignment authority under Booking. |
| §16 | Financials owns payment/invoice/refund/payout/commission/ledger/settlement | GAP | Enterprise transformed accounting ownership must converge to Financials/public contracts. |
| §17–20 | Communications, Engagement, Configuration, Dispute ownership | TRANSITIONAL | Main consolidation exists; final dependency/config separation proof remains mandatory. |
| §21 | Enterprise owns corporate account/member/fleet/eligibility only; accounting remains Financials | GAP | Corporate invoice/payment-accounting artifacts under Enterprise violate explicit ownership. |
| §22 | Audit business/security records distinct from technical logging | PASS | Audit and Observability are separate owners; administrative audit completeness remains behavioral work. |
| §23 | Real-responsibility internal layers; no ceremonial folders | TRANSITIONAL | Some contexts still use legacy/inconsistent shapes; normalize only where a real responsibility exists. |
| §24–32 | Exactly one UI SDK + Registry; canonical hierarchy; scope/version immutability | TRANSITIONAL | Two canonical packages exist; final gate rejects legacy hierarchy vocabulary and product-coupled generic SDUI. Complete immutable/version behavior remains executable proof. |
| §33 | One Foundation kernel; universal primitives only | TRANSITIONAL | Kernel is canonical; final scan rejects upward dependency residue and later convergence must prove no business ownership leaks into Foundation. |
| §34 | Platform owns technology only | TRANSITIONAL | Platform shape is strong; final ownership proof must reject business policy/repositories. |
| §35–36 | Inward dependency law + public boundaries | TRANSITIONAL | Final gate checks API/platform/vendor leakage, surface isolation and deep cross-domain imports; public-boundary convergence remains unfinished. |
| §37 | Real transaction propagation + PostgreSQL rollback proof | GAP | Freeze requires executable rollback evidence, not interface names. |
| §38 | Versioned events/outbox SHOULD for cross-domain side effects | REVIEW | Not a universal MUST; critical atomic side effects must be evaluated during semantic convergence. |
| §39 | Minor-unit Money, immutable quotation snapshots, ledger/idempotency/double-entry invariants | GAP | Must be proven for implemented financial workflows. |
| §40 | Booking/Operations concurrency, explicit transitions, Clock | GAP | Requires semantic + concurrency/rollback tests for implemented critical flows. |
| §41 | Production OTP/session security | GAP | Mock/hardcoded OTP and weak token behavior are production blockers until replaced/proven secure. |
| §42 | Transport auth separate from resource ownership; public IDs externally | GAP | Must be verified per externally exposed resource. |
| §43 | Typed expected errors; transport mapping; no internal leakage | TRANSITIONAL | Error architecture exists but requires complete endpoint/error proof. |
| §44 | Env/secrets separate from business config; no import-time exit; reject unsafe prod defaults | GAP | Requires executable production bootstrap/config proof. |
| §45 | Metadata-first observability + PII redaction + no silent provider failures | GAP | Existing observability is strong; security/PII/provider-failure proof remains required. |
| §46–48 | File-level migration classification + frozen migration order | PASS | The migration process and ordering are governed by the Constitution; physical convergence continues under the existing milestones. |
| §49–50 | Required test layers + literal 100/100/100/100 executable coverage + SDUI matrix | GAP | Strict coverage is below target; mandatory SDUI behavior matrix must remain executable. |
| §51 | Architecture checks reject listed drift classes | TRANSITIONAL | CW1 strengthened the closeout gate materially; equivalent permanent post-closeout enforcement must survive final cleanup. |
| §52 | No tracked generated/build/coverage output | TRANSITIONAL | Final gate scans tracked output; final clean-tree proof is still required. |
| §53 | Feature gate after freeze | PASS | Becomes mandatory for feature implementation after architecture freeze. |
| §54 | All final freeze criteria simultaneously true | GAP | Freeze cannot be declared until every mandatory row is PASS and final exact-SHA validation is green. |
| §55–56 | Partner-first delivery after freeze; shared contexts remain neutral | PASS | Product feature implementation remains behind architecture freeze. |

## Mandatory CW2–CW6 queue produced by CW1

### CW2 — Physical structure convergence
1. Remove transitional `packages/*` and exact workspace residue.
2. Materialize canonical API `bootstrap/surfaces/transport/system` structure in checked-in source.
3. Remove legacy API business/module/container/provider/root transport authorities.
4. Normalize real domain application/infrastructure/public ownership without ceremonial folders.
5. Remove generated/transitional compatibility identities after consumers move.

### CW3 — Ownership and dependency convergence
1. Move CorporateInvoice/payment-accounting responsibility from Enterprise to Financials.
2. Verify Booking vs Operations ownership for slot/capacity/assignment/dispatch/tracking/execution.
3. Verify Partner/Profile/KYC consolidation and eliminate duplicate authority.
4. Enforce cross-domain access through public contracts/application services/events only.
5. Enforce Partner/Customer/Admin transport isolation and SDUI product neutrality.

### CW4 — Domain/application semantic convergence
1. Application orchestrates; domain owns invariants/state transitions.
2. Mandatory `ExecutionContext.actor` everywhere after transport conversion.
3. Clock/ID/transaction/idempotency contracts used where Constitution requires them.
4. Remove unreachable/dead defensive branches instead of fabricating impossible test states.
5. Prove transaction propagation and critical concurrency behavior.

### CW5 — Security/infrastructure production convergence
1. Replace mock/development OTP behavior with the secure challenge lifecycle/provider abstraction required by §41.
2. Implement/prove cryptographically strong refresh-token lifecycle and reuse detection.
3. Complete resource ownership authorization audit.
4. Prove config/secrets production rejection rules.
5. Prove PII redaction and provider-failure observability.
6. Prove implemented financial invariants/idempotency/double-entry requirements.

### CW6 — Proof and freeze
1. Every mandatory matrix row PASS; every REVIEW item has an evidence-backed disposition.
2. Architecture/contract/integration/E2E/security tests green.
3. Prisma validate/generate/migrate green.
4. Build + lint + complete tests green.
5. Production coverage exactly 100% statements/branches/functions/lines.
6. Constitution gate green before and after executable validation.
7. Remove one-time closeout machinery only after all proof passes.
8. Commit canonical final tree and prove exact final SHA CI green.

## CW1 double-cross-check closure rule

CW1 (the user's Phase 1 review) is closed only when all are true:

- the Master Constitution has been reread as the sole authority;
- every Constitution section 1–56 is represented above;
- the bootstrap/freeze contract/playbook and live ledger have been compared against the matrix;
- known gaps are not mislabeled as complete;
- status vocabulary accounts for every classification used in the matrix;
- no additional project phases/milestones have been invented beyond the four frozen milestones;
- the closeout Constitution gate rejects the high-risk drift classes identified by this audit;
- workspace-root enforcement is exact, not merely an allow/deny subset check;
- canonical API entry-point/root enforcement rejects legacy root authorities in the final candidate;
- public-boundary enforcement permits public subpaths while rejecting deep internal cross-domain imports;
- the exact Phase-1/CW1 HEAD passes normal Prisma/build/lint/Vitest validation;
- no Constitution requirement is weakened or amended to accommodate current code.
