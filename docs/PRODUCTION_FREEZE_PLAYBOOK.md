# CarBroz Backend — Production Freeze Playbook

This playbook defines **how** to execute the freeze. Architecture remains governed only by `docs/MASTER-BACKEND-CONSTITUTION.md`; completion criteria are in `docs/PRODUCTION_FREEZE_CONSTITUTION.md`; live task state is in `docs/PRODUCTION_FREEZE_EXECUTION.md`.

## 1. One continuous execution loop

For the first unfinished task in the live execution ledger:

1. Verify live branch HEAD and relevant exact-SHA CI/closeout evidence.
2. Identify the canonical owner and applicable Master Constitution rules.
3. Inspect current checked-in source before consulting historical convergence scripts.
4. Classify the actual defect before editing.
5. Implement the smallest root-cause correction. Do not redesign unrelated architecture.
6. Run the strongest available targeted validation first.
7. Run broader build/lint/tests/architecture checks appropriate to the batch.
8. For coverage work, measure strict production coverage and inspect exact remaining misses.
9. Update the live execution ledger with exact evidence.
10. Commit a coherent batch.
11. Confirm CI/closeout at the appropriate boundary.
12. Continue to the next unfinished task unless a real stop condition exists.

## 2. Validation layers after CW3

CW2 established the checked-in canonical physical tree and CW3 established the checked-in business ownership/dependency graph. Permanent validation is read-only and has four distinct levels:

1. **CW2 physical verifier** — `node tools/architecture-closeout.mjs`
   - exact 23 production workspaces;
   - exact five workspace globs;
   - exact API roots `bootstrap/surfaces/system/transport`;
   - no transitional source roots;
   - permanent immutable CI wiring.
2. **CW1/CW2 Constitution regression gate** — `node tools/architecture-closeout-constitution-gate.mjs --regression`
   - protects already-closed Constitution invariants;
   - permits only the explicitly recorded later-workstream blocker baseline;
   - fails if that baseline expands.
3. **CW3 bounded-context/dependency gate** — `node tools/cw3-boundary-gate.mjs`
   - protects Enterprise/Financials ownership;
   - protects Booking/Operations ownership;
   - protects Partner/Profile/KYC consolidation;
   - rejects deep cross-domain/internal coupling and stale dependency direction;
   - protects API-surface isolation and SDUI product neutrality.
4. **Full Constitution gate** — `node tools/architecture-closeout-constitution-gate.mjs`
   - has no later-workstream exceptions;
   - is expected to expose genuine unfinished CW4-CW6 blockers until those workstreams resolve them;
   - must be green for final freeze.

Never treat levels 1–3 as evidence that level 4 is green.

## 3. Local-first validation

When a local execution environment is available, use it before remote CI. CI is confirmation, not the debugging loop.

Prefer this validation order where applicable:

1. targeted unit/architecture test for changed behavior;
2. package/domain build or typecheck;
3. relevant integration/contract tests;
4. CW2 physical verifier when topology/CI changes;
5. CW1/CW2 regression gate;
6. CW3 boundary gate when ownership/dependency/public-boundary-sensitive code changes;
7. repository build;
8. lint;
9. complete normal test suite;
10. repeat closed-workstream gates after validation when the workflow requires clean-tree proof;
11. full Constitution gate when closing a later-workstream blocker;
12. strict freeze/coverage suite when applicable.

`pnpm freeze:preflight` is the non-mutating convenience gate for the permanent closed-workstream baseline. It executes the CW2 verifier, CW1/CW2 regression gate and CW3 boundary gate before/after the broader validation sequence. It does not replace the default/full Constitution gate or strict coverage required by CW6.

Do not claim a command ran locally when the current agent has no repository shell/runtime. In that case use the strongest available repository/CI evidence and record the limitation honestly.

## 4. Closed-workstream discipline

CW1-CW3 are closed.

For any suspected regression in those areas:

- verify the claim against current checked-in source;
- run/read the applicable permanent gate;
- reopen a closed workstream only when current executable evidence proves the invariant is violated;
- do not reinterpret later CW4/CW5 semantic/security work as a reason to redo CW2 topology or CW3 ownership;
- if a genuine regression is proven, fix the smallest root cause and strengthen the relevant existing gate rather than creating a parallel architecture authority.

## 5. Architecture residual workflow

For each suspected architecture issue:

- verify the claim against current checked-in source;
- map the relevant Master Constitution requirement;
- inspect existing architecture tests/gates;
- consult dormant historical convergence scripts only when producer history is materially relevant;
- classify the issue as `DONE`, `STALE`, `REJECT`, `PARTIAL`, or `VALID GAP`;
- only code a `VALID GAP`;
- add or strengthen executable regression enforcement when a real invariant is not already permanently protected.

If a full-gate blocker belongs to a later workstream, keep it visible and assign it there. Do not make an earlier workstream red merely because later work is intentionally unfinished, and do not weaken the full gate to make it green.

## 6. Later-workstream baseline discipline

The regression gate may contain exact-path baseline exceptions only when all of the following are true:

- the full gate proves the blocker exists;
- the execution ledger assigns it to a later workstream;
- the exception is narrow enough that any new offending file still fails CI;
- the full gate retains the original rule with no exception;
- removing the blocker requires deleting its regression-baseline exception in the same coherent change.

Baseline exceptions are technical debt markers, not waivers of the Constitution. CW3 removed its former Enterprise-accounting exception set; the current baseline contains only explicitly recorded CW5 blockers.

## 7. Coverage convergence workflow

For each coverage miss:

1. identify file, line/function/branch misses;
2. read current canonical source and existing tests/contracts;
3. classify each miss;
4. fix semantic/design problems first;
5. remove genuinely dead/unreachable logic when the contract proves it cannot occur;
6. add behavior-focused tests for legitimate paths;
7. run targeted tests;
8. remeasure strict coverage;
9. record exact delta and next miss in the execution ledger.

Never add an impossible `ExecutionContext`, anonymous actor, invalid DTO, unsafe cast or fake adapter just to execute a branch.

## 8. Commit and CI discipline

- Keep commits coherent and root-cause focused.
- Do not create safety/backup branches for ordinary work.
- Do not overlap closeout-triggering commits while the closeout verifier is running; its concurrency policy may cancel the previous run.
- Documentation-only progress may be committed separately when it does not alter executable authority.
- Production/tooling changes that trigger closeout should be batched only after targeted verification.
- A newer production/tooling SHA requires its own relevant validation; do not cite an older green run as proof of new executable behavior.
- Documentation evidence commits may cite the immediately preceding validated executable SHA, but must never imply that docs themselves changed the validated production behavior.

## 9. Current-source discipline

The checked-in repository is canonical source after CW2/CW3. Permanent CI does not materialize a separate final architecture candidate.

Before changing a path:

- determine its current constitutional owner;
- confirm the path is canonical checked-in source rather than generated build output;
- preserve the closed bounded-context owner unless current evidence proves a CW3 regression;
- if a historical convergence script also mentions the path, do not assume that script remains an active producer;
- never run a dormant source-rewriting closeout script as a substitute for implementing the current owner correctly.

## 10. Ledger update format

Every completed implementation batch records:

- workstream/task and new status;
- implementation commit SHA;
- changed canonical owner/files;
- targeted validation;
- normal CI run/result when available;
- architecture closeout run/result when applicable;
- full Constitution-gate blocker delta when applicable;
- strict coverage before/after when applicable;
- remaining blocker or next task.

The first unfinished task is the only default continuation point.

## 11. Stop conditions

Stop only for:

- genuine Master Constitution/product conflict;
- unresolved ownership choice not decidable from repository evidence;
- missing external business decision;
- repository/tool permission failure;
- validation failure requiring investigation before safe continuation.

Ordinary implementation decisions do not require repeated user approval.
