# CarBroz Backend — AI Project Bootstrap

**Purpose:** single mandatory entry point for every AI or human session continuing the CarBroz backend production freeze.

<!--
REFERENCE INVOCATION ONLY — text for a new session:

Read `docs/AI_PROJECT_BOOTSTRAP.md` completely. Follow its instructions exactly. Verify the current repository, current HEAD, current exact-SHA CI, and the live execution ledger. Then continue from the first unfinished task without redesigning the architecture or restarting closed workstreams.
-->

## 1. Mandatory operating rule

This file is the only document a new session needs to be told about. After reading it, the session MUST discover and read the required sources itself. Conversation history, model memory, audits and prior summaries are advisory only and never repository truth.

Do not plan a replacement architecture. Do not restart CW1 or CW2. Do not create duplicate ownership. Continue the existing production-freeze program from verified repository state.

## 2. Repository and working branch

- Repository: `LalitDev2305/CarBroz-Customer-Backend`
- Working branch: `fix/stage-a-production-definitions`
- Sole normative architecture authority: `docs/MASTER-BACKEND-CONSTITUTION.md`
- Live execution status: `docs/PRODUCTION_FREEZE_EXECUTION.md`
- Freeze policy / Definition of Done: `docs/PRODUCTION_FREEZE_CONSTITUTION.md`
- Execution method: `docs/PRODUCTION_FREEZE_PLAYBOOK.md`
- Literal compliance matrix: `docs/CONSTITUTION-COMPLIANCE-MATRIX.md`
- CW2 closeout evidence: `docs/CW2-PHYSICAL-STRUCTURE-CLOSEOUT.md`
- Historical forensic evidence: `docs/PRODUCTION-ARCHITECTURE-CLOSEOUT-IMPLEMENTATION.md`

`PRODUCTION_FREEZE_CONSTITUTION.md` is a freeze contract only. It MUST NOT redefine architecture governed by the Master Constitution.

## 3. Source-of-truth precedence

When sources disagree, use this order:

1. `docs/MASTER-BACKEND-CONSTITUTION.md`
2. current checked-in source at verified branch HEAD
3. executable architecture/contract/regression/full-gate behavior
4. current exact-SHA CI/closeout/coverage evidence
5. `docs/PRODUCTION_FREEZE_EXECUTION.md`
6. the compliance matrix and CW closeout records
7. historical ledgers/audits/agent output/conversation memory

No lower source may override a higher source.

## 4. Mandatory startup protocol

Before any implementation change, every session MUST:

1. Verify repository identity and branch `fix/stage-a-production-definitions`.
2. Fetch live branch HEAD. Never assume a SHA recorded in documentation is still current.
3. Read this bootstrap completely.
4. Read `docs/MASTER-BACKEND-CONSTITUTION.md`.
5. Read `docs/PRODUCTION_FREEZE_EXECUTION.md` completely.
6. Read `docs/PRODUCTION_FREEZE_CONSTITUTION.md` and `docs/PRODUCTION_FREEZE_PLAYBOOK.md`.
7. Read the compliance matrix/CW2 closeout when the current workstream touches those rules.
8. Inspect the latest normal CI for live HEAD.
9. Inspect architecture closeout and full Constitution evidence when relevant.
10. Verify the first unfinished task against live source before editing.
11. Read only domain/package documentation relevant to the change unless a broader audit is explicitly required.

If live evidence invalidates this bootstrap or execution ledger, correct the control-plane documentation before allowing a future session to continue from stale instructions.

## 5. Frozen decision rule

No coding decision comes from memory, assumption, Copilot, ChatGPT, Antigravity or any other agent alone.

Every decision requires agreement between:

1. Master Backend Constitution,
2. current checked-in source evidence,
3. executable validation.

If a requested change conflicts with the Master Constitution, stop that implementation path. Record the conflict and intentionally amend the Master Constitution together with enforcement before changing production architecture.

## 6. Non-negotiable architecture rules

- Modular Monolith + DDD bounded contexts + Clean/Hexagonal dependency direction remain frozen.
- Workspace roots are exactly `apps/*`, `domains/*`, `sdui/*`, `platform/*`, `foundation/*`.
- No generic production ownership under `packages`, `shared`, `common`, `libs`, generic SDK or utils roots.
- `apps/api` is transport/composition only; no business authority, repositories or state machines.
- `apps/api/src` is physically limited to `bootstrap`, `surfaces`, `system`, `transport`.
- Partner, Customer and Admin transport/product surfaces remain isolated.
- SDUI Customer and Partner concerns remain independently scoped/versioned where required.
- Cross-domain dependencies use approved public boundaries.
- Infrastructure/vendor details do not leak inward into domain/application ownership.
- `ExecutionContext.actor` is mandatory where the Constitution requires execution context.
- Do not preserve dead compatibility authority without verified need.
- Do not introduce event sourcing, a global Result/Either model, a DI framework or another mechanism merely because an audit/agent recommends it.

## 7. Post-CW2 repository state

The branch is **not** a transitional pre-closeout source anymore. CW2 materialized the canonical physical topology into checked-in source.

Permanent CI does not construct or rewrite a separate architecture candidate. Current checked-in source is the owner to fix.

Historical one-time source-rewriting closeout scripts may still exist temporarily. Treat them as forensic history unless current repository evidence explicitly proves an active generation responsibility. Normal CI, CW2 closeout verification and freeze preflight MUST NOT execute them.

## 8. Constitution verification modes

### Permanent CW1/CW2 regression protection

```text
node tools/architecture-closeout-constitution-gate.mjs --regression
```

This read-only mode protects already-closed invariants while allowing only exact, documented later-workstream blocker paths. It must fail if that blocker baseline expands.

### Full fail-closed Constitution verification

```text
node tools/architecture-closeout-constitution-gate.mjs
```

This read-only mode has no later-workstream exceptions. Use it during CW3-CW6 to measure real convergence. It MUST pass for final freeze.

Never equate a green regression gate with full Constitution compliance.

## 9. Current validated executable baseline

Validated reconciliation commit:

`37cb1c1ff8fb025d94d5f9107a6abae0639ff904`

Exact-SHA evidence from September 6, 2026:

- **CarBroz Backend CI #1383** — run `34027645386` — SUCCESS.
- **Backend Architecture Closeout Verifier #126** — run `34027645311` — SUCCESS.

Both passed frozen-lockfile installation, exact CW2 topology, CW1/CW2 regression Constitution verification, Prisma validate/generate/migrate, build, lint, full Vitest, post-validation regression verification and non-mutating clean-tree proof.

The earlier full-gate diagnostic on `8f3f4bfdea40eafa18b0547f8d428514d899984c` intentionally exposed genuine later-workstream blockers in Enterprise accounting ownership, Identity production OTP/token behavior and two direct-console logging paths. See the live execution ledger; those blockers are not waived.

## 10. Production-freeze milestones

There are exactly four execution milestones. Do not add new project phases or restart them under different names.

1. **M1 — Repository Foundation & AI Operating System** — DONE / maintained.
2. **M2 — Repository Convergence** — IN PROGRESS; CW1 and CW2 are closed, CW3 is first unfinished.
3. **M3 — Production Convergence** — semantic/security/coverage convergence continues through later workstreams.
4. **M4 — Production Freeze** — full Constitution + all tests/migrations/build/lint + literal 100/100/100/100 + clean tree + exact-final-SHA evidence.

The authoritative current workstream is always `docs/PRODUCTION_FREEZE_EXECUTION.md`.

## 11. Implementation loop

The word **continue** means:

1. verify startup protocol and live HEAD;
2. locate the first unfinished execution-ledger task;
3. inspect its current canonical owner and consumers;
4. implement the smallest root-cause correction;
5. run targeted validation;
6. run permanent regression validation;
7. run the full Constitution gate when reducing a full-gate blocker;
8. run/confirm broader CI at the coherent boundary;
9. update ledger evidence;
10. continue unless a real stop condition exists.

Do not answer `continue` with a new architecture plan when implementation can safely proceed.

## 12. Coverage law

Final production coverage is literal: **100% statements / 100% branches / 100% functions / 100% lines**.

Forbidden shortcuts include threshold reduction, scope weakening, coverage-ignore directives, fake tests, impossible object states, unsafe casts solely for coverage, private-method invocation solely for coverage and preserving meaningless branches merely so they can be tested.

## 13. CI and closeout discipline

Development should use targeted/local validation first when available; CI is exact-SHA confirmation.

Do not overlap closeout-triggering commits while the closeout verifier is active. Keep executable and documentation/evidence batches coherent. A newer executable SHA needs its own relevant validation.

When fixing a file listed in the regression baseline, remove that exception in the same coherent implementation change.

## 14. Required handoff discipline

At the end of every meaningful implementation batch, update the live ledger with:

- verified implementation SHA;
- workstream status;
- changed owners/files;
- targeted validation;
- CI/closeout run IDs;
- full-gate blocker delta when relevant;
- coverage delta when relevant;
- first unfinished task;
- genuine blocker if any.

A workstream is not DONE because an agent says it is. Repository evidence and required executable validation decide.

## 15. Stop conditions

Stop and request a project-owner decision only for a genuine Constitution/product conflict, an ownership choice that cannot be resolved from repository evidence, a missing external/business decision, a permission failure, or a validation defect whose safe resolution requires changing a frozen product/architecture decision.

Otherwise continue execution without repeated approval between ordinary tasks.
