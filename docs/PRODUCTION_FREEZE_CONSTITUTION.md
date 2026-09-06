# CarBroz Backend — Production Freeze Contract

**Status:** ACTIVE  
**Architecture authority:** `docs/MASTER-BACKEND-CONSTITUTION.md`

This document is the production-freeze contract and Definition of Done. It is deliberately **not** a second architecture constitution. `MASTER-BACKEND-CONSTITUTION.md` remains the sole normative architecture authority. If this contract conflicts with it, the Master Constitution wins and this contract must be corrected.

## 1. Freeze objective

The backend is frozen only when the checked-in repository has one canonical architecture, one owner for every business capability, no duplicate/transitional production authority, and every required executable quality gate passes on the exact final SHA.

CW1/CW2 closure is not the production freeze. Their permanent regression guards protect already-converged architecture while CW3-CW6 close remaining ownership, semantics, security and coverage gaps.

## 2. Architecture freeze requirements

The final checked-in source MUST satisfy the Master Constitution and its executable gates, including:

- canonical workspace roots only: `apps/*`, `domains/*`, `sdui/*`, `platform/*`, `foundation/*`;
- no generic production authority under `packages`, `shared`, `common`, `libs`, generic SDK or utils roots;
- `apps/api` transport/composition only;
- DDD bounded-context ownership and inward dependency direction;
- public cross-domain boundaries rather than infrastructure/deep-import leakage;
- Partner/Customer/Admin surface isolation;
- SDUI ownership/versioning rules;
- mandatory valid `ExecutionContext.actor` semantics;
- provider/port dependency inversion;
- domain/application independence from Prisma, Fastify and vendor SDK implementation details;
- structured observability/correlation and safe PII handling required by the Master Constitution.

No audit recommendation is architecture law unless the Master Constitution and current executable evidence support it.

## 3. Constitution gate model

`tools/architecture-closeout-constitution-gate.mjs` is read-only in every mode.

### 3.1 Permanent CW1/CW2 regression mode

```text
node tools/architecture-closeout-constitution-gate.mjs --regression
```

This mode is a permanent CI guard for invariants already closed by CW1/CW2. It allows only explicitly recorded, exact-path later-workstream blockers and fails if those blocker sets expand or if any protected topology/dependency/SDUI/API/foundation invariant regresses.

A green regression gate **does not mean the full Constitution is satisfied**.

### 3.2 Full fail-closed Constitution mode

```text
node tools/architecture-closeout-constitution-gate.mjs
```

The default mode has no later-workstream exceptions. It is the diagnostic convergence gate for CW3-CW6 and is mandatory for final production freeze. Any failure is a real unresolved Constitution blocker unless the Constitution itself is intentionally amended through its required process.

Known later-workstream blockers must be fixed in their owning workstream, not hidden by weakening the full gate.

## 4. Executable final-freeze gates

Every required gate must pass on the exact final candidate SHA:

1. Full read-only Master Constitution gate with **no baseline exceptions**.
2. Permanent CW1/CW2 regression gate.
3. CW2 exact physical-topology verifier.
4. Architecture regression tests.
5. Contract tests.
6. Unit/integration tests.
7. End-to-end tests required by the repository freeze suite.
8. Prisma schema validation.
9. Prisma generation.
10. Required database migrations against the CI validation database.
11. Full monorepo build/type validation.
12. Lint.
13. Strict executable production coverage.
14. Clean-tree/non-mutating verification after validation.
15. Exact-final-SHA CI evidence recorded in the execution ledger.

A partially green pipeline is not frozen.

## 5. Coverage freeze law

Required production coverage is exactly:

- Statements: **100%**
- Branches: **100%**
- Functions: **100%**
- Lines: **100%**

The include scope and thresholds may not be weakened to achieve freeze.

Forbidden coverage techniques include lowering thresholds, excluding legitimate production code merely to raise metrics, coverage-ignore shortcuts, assertion-free fake tests, manufacturing impossible domain states, unsafe casts solely for coverage, private-internal invocation solely for coverage, retaining dead branches just so they can be tested, or duplicating implementations to make coverage easier.

Every uncovered path must be classified first. Root-cause design/behavior defects are fixed before metric chasing.

## 6. Current-source and one-time-tool integrity

CW2 materialized the canonical physical topology into the checked-in branch. The checked-in tree is now the development source of truth; permanent CI no longer creates a separate transformed architecture candidate.

Some historical one-time convergence producer scripts may remain temporarily for forensic traceability or later cleanup. They are **not** permanent validation authorities and MUST NOT be imported or executed by normal CI, CW2 closeout verification, or production-freeze preflight.

When a surviving one-time producer explains how current code was created, use it as historical evidence only. Fix current canonical source at its real owner unless a later workstream explicitly proves that a producer still owns an active generation step.

One-time convergence machinery may be deleted when no required evidence/workflow depends on it; deletion itself is not proof of freeze.

## 7. Decision integrity

A production decision is accepted only when all three agree:

1. Master Constitution,
2. current checked-in source evidence,
3. executable validation.

Conversation memory, agent recommendations and historical audits cannot override these sources.

If required product behavior conflicts with the Master Constitution, implementation does not silently redesign around it. The conflict must be explicit; the Master Constitution and its enforcement are intentionally amended before implementation proceeds.

## 8. Forbidden freeze shortcuts

The following cannot be used to declare completion:

- architecture redesign under a new name;
- duplicate compatibility authorities with no proven temporary need;
- moving business logic into transport;
- introducing generic shared ownership;
- bypassing public boundaries;
- accepting failing/skipped required tests;
- treating the regression gate as equivalent to the full Constitution gate;
- accepting stale CI as proof for a newer production SHA;
- marking a task complete without repository evidence;
- treating a docs-only assertion as executable proof;
- deleting failing tests/gates instead of resolving the defect;
- adding event sourcing, global Result/Either, DI frameworks or other mechanisms solely because an audit suggested them.

## 9. Definition of Done

The CarBroz backend production architecture is **FROZEN** only when all of the following are simultaneously true:

- final checked-in topology exactly satisfies the Master Constitution;
- every bounded capability has one canonical owner;
- transport contains no business authority;
- cross-domain/public boundaries are clean and enforced;
- product surfaces are isolated as required;
- SDUI architecture is canonical and independently scoped/versioned as required;
- identity/auth/context/RBAC/ownership contracts are valid and tested;
- transaction/event/outbox behavior required by the Master Constitution is valid and tested;
- observability/correlation/PII requirements are valid and tested;
- no forbidden transitional production authority survives;
- Prisma validation/generation/migrations pass;
- build and lint pass;
- complete required test suites pass;
- production coverage is 100/100/100/100;
- the **full** Constitution gate passes before/after final validation;
- CW1/CW2 regression and physical-topology guards pass;
- validation leaves tracked source unchanged;
- the execution ledger records the exact final commit and successful validation evidence;
- no unresolved `GAP`, `VALID GAP`, `IN PROGRESS`, `BLOCKED`, or unknown freeze item remains.

Until every item is proven, status remains **NOT FROZEN**.
