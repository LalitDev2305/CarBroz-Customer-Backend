# CarBroz Backend — Production Freeze Contract

**Status:** ACTIVE  
**Architecture authority:** `docs/MASTER-BACKEND-CONSTITUTION.md`

This document is the production-freeze contract and Definition of Done. It is deliberately **not** a second architecture constitution. `MASTER-BACKEND-CONSTITUTION.md` remains the sole normative architecture authority. If this contract conflicts with it, the Master Constitution wins and this contract must be corrected.

## 1. Freeze objective

The backend is frozen only when the repository has one canonical architecture, one owner for every business capability, no transitional/duplicate authority in the final candidate, and all required executable quality gates pass without exceptions.

## 2. Architecture freeze requirements

Final candidate MUST satisfy the Master Constitution and its executable gates, including:

- canonical workspace roots only: `apps/*`, `domains/*`, `sdui/*`, `platform/*`, `foundation/*`;
- no final generic `packages`, `shared`, `common`, `libs`, generic SDK or utils authority;
- `apps/api` transport/composition only;
- DDD bounded-context ownership and inward dependency direction;
- public cross-domain boundaries rather than infrastructure/deep-import leakage;
- Partner/Customer/Admin surface isolation;
- SDUI ownership/versioning rules;
- mandatory valid ExecutionContext actor semantics;
- provider/port dependency inversion;
- domain/application independence from Prisma, Fastify and vendor SDK implementation details;
- structured observability/correlation and safe PII handling required by the Master Constitution.

No audit recommendation is architecture law unless the Master Constitution and current evidence support it.

## 3. Executable freeze gates

Every required gate must pass on the final candidate:

1. Master Constitution topology/ownership gate.
2. Architecture regression tests.
3. Contract tests.
4. Unit/integration tests.
5. End-to-end tests required by the repository freeze suite.
6. Prisma schema validation.
7. Prisma generation.
8. Required database migrations against the CI validation database.
9. Full monorepo build/type validation.
10. Lint.
11. Strict production coverage.
12. Final closeout/freeze executor downstream gates.

A partially green pipeline is not frozen.

## 4. Coverage freeze law

Required production coverage is exactly:

- Statements: **100%**
- Branches: **100%**
- Functions: **100%**
- Lines: **100%**

The include scope and thresholds may not be weakened to achieve freeze.

Forbidden coverage techniques:

- lowering thresholds;
- excluding legitimate production files/branches merely to raise metrics;
- coverage-ignore directives used as a substitute for design/test work;
- fake tests with no behavioral assertion;
- manufacturing impossible domain states;
- unsafe casts solely to enter impossible branches;
- invoking private internals solely for coverage;
- retaining dead/unreachable branches only so they can be tested;
- duplicating transformed implementations to make coverage easier.

Every uncovered path must be classified as meaningful missing behavior/test, business/error boundary, dead/unreachable code, generated/bootstrap glue, semantic design defect, or instrumentation/configuration defect. Root cause is fixed before metric chasing.

## 5. Transformation integrity

The current branch may contain legitimate one-time migration inputs. Final-state compliance is judged on the canonical closeout candidate, but defects must be fixed at their true producer.

Therefore:

- trace transformed files back to source/transformation producers;
- do not prematurely delete migration inputs still required by the executor;
- do not patch generated output alone;
- do not create parallel final implementations;
- remove one-time closeout tooling only after every final freeze gate passes.

## 6. Decision integrity

A production decision is accepted only when all three agree:

1. Master Constitution,
2. current/final source evidence,
3. executable validation.

Conversation memory, agent recommendations and historical audits cannot override these sources.

If required product behavior conflicts with the Master Constitution, the architecture is not silently changed. The conflict must be explicit and the Master Constitution plus its enforcement must be intentionally amended before implementation proceeds.

## 7. Forbidden freeze shortcuts

The following cannot be used to declare completion:

- architecture redesign under a new name;
- duplicate compatibility authorities with no proven temporary need;
- moving business logic into transport;
- introducing generic shared ownership;
- bypassing public boundaries;
- accepting failing/skipped required tests;
- accepting stale CI as proof for a newer production SHA;
- marking a task complete without repository evidence;
- treating a docs-only assertion as executable proof;
- deleting failing tests/gates instead of resolving the defect;
- adding event sourcing, global Result/Either, DI frameworks or other mechanisms solely because an audit suggested them.

## 8. Definition of Done

The CarBroz backend production architecture is **FROZEN** only when all of the following are simultaneously true:

- final topology exactly satisfies the Master Constitution;
- every bounded capability has one canonical owner;
- transport contains no business authority;
- cross-domain/public boundaries are clean and enforced;
- product surfaces are isolated as required;
- SDUI architecture is canonical and independently scoped/versioned as required;
- identity/auth/context/RBAC/ownership contracts are valid and tested;
- transaction/event/outbox behavior required by the Master Constitution is valid and tested;
- observability/correlation/PII requirements are valid and tested;
- no forbidden transitional authority survives the final candidate;
- Prisma validation/generation/migrations pass;
- build and lint pass;
- complete required test suites pass;
- production coverage is 100/100/100/100;
- Constitution/architecture/contract/freeze gates pass;
- one-time closeout tooling is removed only at the executor-approved final step;
- the execution ledger records the exact final commit and successful validation evidence;
- no unresolved `VALID GAP`, `IN PROGRESS`, `BLOCKED`, or unknown freeze item remains.

Until every item is proven, status remains **NOT FROZEN**.
