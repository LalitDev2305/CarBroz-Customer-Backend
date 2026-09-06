# CarBroz Backend V3 — Constitution Compliance Matrix

**Authority:** `docs/MASTER-BACKEND-CONSTITUTION.md` only  
**Purpose:** Phase 1 executable gap map for literal Constitution convergence  
**Rule:** This document records evidence/status; it does not redefine architecture. If it conflicts with the Master Constitution, the Master Constitution wins.

## Status vocabulary

- **PASS** — checked-in/final-candidate evidence satisfies the rule.
- **TRANSITIONAL** — deterministic migration exists, but checked-in source is not yet the final physical state.
- **GAP** — current evidence contradicts or does not yet satisfy a mandatory Constitution rule.
- **DEFERRED-CAPABILITY** — optional/not-yet-implemented capability; no empty ceremonial folder is required.

## Phase 1 finding

The architecture direction is valid, but literal freeze is not yet reached. Phase 1 establishes the complete rule families and converts high-risk mandatory rules into executable closeout checks. Later phases must change the repository to satisfy this matrix; the matrix must never be weakened to make existing code pass.

| Constitution | Requirement | Current classification | Evidence / required convergence |
|---|---|---|---|
| §1–2 | Master Constitution sole authority; modular monolith + DDD + Clean/Hexagonal | PASS | Constitution and bootstrap/freeze workflow use this file as authority. |
| §3–4 | Partner, Customer, Admin first-class and isolated | TRANSITIONAL | Final candidate has surfaces, but closeout enforcement must reject cross-surface imports and generic product endpoint ownership. |
| §5–7 | Exact canonical roots; no `packages/shared/libs/common`; workspace only five source roots | TRANSITIONAL | Checked-in workspace still contains `packages/*`; closeout must remove it and exact-root gate must reject extras. |
| §8–9 | `apps/api` composition/transport only; `bootstrap/surfaces/transport/system`; three API families | TRANSITIONAL | Legacy API module/container structure is migration input. Final gate must require canonical API roots and forbid API business ownership. |
| §10 | Identity owns auth, OTP, sessions, token policy, RBAC | GAP | Identity ownership exists, but production OTP/token behavior is not yet Constitution-complete (§41). |
| §11 | Partner owns profile/org/member/KYC/training/capability/availability/lifecycle | TRANSITIONAL | Consolidation largely exists; generated/legacy Partner module identities and actor semantics require convergence. |
| §12 | Customer owns profile/preferences/address/garage/account state | PASS/DEFERRED-CAPABILITY | Existing ownership is canonical; unimplemented product capabilities do not justify empty folders. |
| §13 | Catalog + Pricing one context, internally separated | PASS | Canonical context exists; financial settlement must remain outside. |
| §14–15 | Booking owns booking state; Operations owns capacity/assignment/dispatch/tracking/execution | TRANSITIONAL | Ownership migration exists; gate must reject dispatch/tracking/slot authority under Booking. |
| §16 | Financials owns payment/invoice/refund/payout/commission/ledger/settlement | GAP | Enterprise currently has transformed CorporateInvoice/payment-reconciliation ownership that must move to Financials/public contracts. |
| §17–20 | Communications, Engagement, Configuration, Dispute ownership | PASS/TRANSITIONAL | Main consolidation exists; final deep-import/config separation checks remain mandatory. |
| §21 | Enterprise owns corporate account/member/fleet/eligibility only; accounting remains Financials | GAP | Corporate invoice/payment-accounting artifacts under Enterprise violate explicit ownership. |
| §22 | Audit business/security records distinct from technical logging | PASS | Audit and Observability are separate owners; administrative audit completeness remains behavioral work. |
| §23 | Real-responsibility internal layers; no ceremonial folders | TRANSITIONAL | Some contexts still use inconsistent root `use-cases`/legacy module shapes; normalize only where responsibility exists. |
| §24–32 | Exactly one UI SDK + Registry; canonical hierarchy; scope/version immutability | PASS/TRANSITIONAL | Two canonical packages exist. Final gate must reject legacy vocabulary, duplicate SDUI authorities and product-coupled generic SDUI. |
| §33 | One Foundation kernel; universal primitives only | PASS/TRANSITIONAL | Kernel is canonical; final scan must reject business concepts/upward imports. |
| §34 | Platform owns technology only | PASS/TRANSITIONAL | Platform shape is strong; final scan must reject business-named repositories/business policy. |
| §35–36 | Inward dependency law + public boundaries | TRANSITIONAL | Existing checks cover API/platform leakage but need cross-domain public-boundary and surface isolation enforcement. |
| §37 | Real transaction propagation + PostgreSQL rollback proof | GAP until proof | Freeze requires executable rollback evidence, not interface names. |
| §38 | Versioned events/outbox SHOULD for cross-domain side effects | REVIEW | Not a universal MUST; critical atomic side effects must be evaluated during semantic convergence. |
| §39 | Minor-unit Money, immutable quotation snapshots, ledger/idempotency/double-entry invariants | GAP until proof | Must be proven for implemented financial workflows. |
| §40 | Booking/Operations concurrency, explicit transitions, Clock | GAP until proof | Requires semantic + concurrency/rollback tests for implemented critical flows. |
| §41 | Production OTP/session security | GAP | Mock OTP and weak timestamp-derived refresh token behavior remain production blockers. |
| §42 | Transport auth separate from resource ownership; public IDs externally | GAP until endpoint audit | Must be verified per externally exposed resource. |
| §43 | Typed expected errors; transport mapping; no internal leakage | TRANSITIONAL | Error architecture exists but requires complete endpoint/error proof. |
| §44 | Env/secrets separate from business config; no import-time exit; reject unsafe prod defaults | GAP until bootstrap audit | Add executable production bootstrap/config checks. |
| §45 | Metadata-first observability + PII redaction + no silent provider failures | GAP until proof | Existing observability is strong; security/PII/provider-failure tests remain required. |
| §46–48 | File-level migration classification + frozen migration order | PASS for process | This matrix is the Phase 1 rule-family map; physical convergence follows in Phase 2. |
| §49–50 | Required test layers + literal 100/100/100/100 executable coverage + SDUI matrix | GAP | Strict coverage is below target; SDUI mandatory behavior matrix must remain executable. |
| §51 | Architecture checks reject all listed drift classes | GAP -> Phase 1 enforcement | Closeout gate is strengthened in Phase 1; permanent post-closeout policy must retain equivalent enforcement. |
| §52 | No tracked generated/build/coverage output | GAP until final-tree proof | Final gate must reject source-tree generated output and clean-tree closeout must prove no residue. |
| §53 | Feature gate after freeze | PASS as normative process | Becomes mandatory after architecture freeze. |
| §54 | All final freeze criteria simultaneously true | GAP | Freeze cannot be declared until every mandatory row is PASS and final exact-SHA CI is green. |
| §55–56 | Partner-first delivery after freeze; shared contexts remain neutral | PASS as delivery policy | Product feature implementation remains blocked behind architecture freeze. |

## Mandatory Phase 2–6 queue produced by Phase 1

### P2 — Physical structure convergence
1. Remove transitional `packages/*` and exact workspace residue.
2. Materialize canonical API `bootstrap/surfaces/transport/system` structure in checked-in source.
3. Remove legacy API business/module/container/provider authorities.
4. Normalize real domain application/infrastructure/public ownership without ceremonial folders.
5. Remove generated/transitional compatibility identities after consumers move.

### P3 — Ownership and dependency convergence
1. Move CorporateInvoice/payment-accounting responsibility from Enterprise to Financials.
2. Verify Booking vs Operations ownership for slot/capacity/assignment/dispatch/tracking/execution.
3. Verify Partner/Profile/KYC consolidation and eliminate duplicate authority.
4. Enforce cross-domain access through public contracts/application services/events only.
5. Enforce Partner/Customer/Admin transport isolation and SDUI product neutrality.

### P4 — Domain/application semantic convergence
1. Application orchestrates; domain owns invariants/state transitions.
2. Mandatory `ExecutionContext.actor` everywhere after transport conversion.
3. Clock/ID/transaction/idempotency contracts used where Constitution requires them.
4. Remove unreachable/dead defensive branches instead of fabricating impossible test states.
5. Prove transaction propagation and critical concurrency behavior.

### P5 — Security/infrastructure production convergence
1. Replace mock OTP with secure challenge lifecycle/provider abstraction.
2. Implement cryptographically strong refresh-token lifecycle/reuse detection.
3. Complete resource ownership authorization audit.
4. Prove config/secrets production rejection rules.
5. Prove PII redaction and provider-failure observability.
6. Prove implemented financial invariants/idempotency/double-entry requirements.

### P6 — Proof and freeze
1. Every mandatory matrix row PASS.
2. Architecture/contract/integration/E2E/security tests green.
3. Prisma validate/generate/migrate green.
4. Build + lint + complete tests green.
5. Production coverage exactly 100% statements/branches/functions/lines.
6. Constitution gate green before and after executable validation.
7. Remove one-time closeout machinery only after all proof passes.
8. Commit canonical final tree and prove exact final SHA CI green.

## Phase 1 cross-check rule

Phase 1 is complete only when:

- the Master Constitution has been reread as the sole authority;
- every Constitution section 1–56 is represented above;
- known gaps are not mislabeled as complete;
- the closeout Constitution gate rejects the high-risk drift classes identified by this audit;
- the current branch compiles after removing impossible-state test fixtures introduced during convergence;
- no Constitution requirement is weakened or amended to accommodate current code.
