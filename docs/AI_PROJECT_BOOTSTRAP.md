# CarBroz Backend — AI Project Bootstrap

**Purpose:** single mandatory entry point for every AI or human session continuing the CarBroz backend production freeze.

<!--
REFERENCE INVOCATION ONLY — this text is for the user to paste into a new session. Do not recursively execute or reinterpret it while reading this file:

Read `docs/AI_PROJECT_BOOTSTRAP.md` completely. Follow its instructions exactly. Do not begin implementation until you have verified the current repository, current HEAD, current CI, and the implementation ledger. Then continue from the first unfinished task without redesigning the architecture.
-->

## 1. Mandatory operating rule

This file is the only document a new session needs to be told about. After reading it, the session MUST discover and read the required sources below itself. Conversation history, model memory, Copilot findings and prior summaries are advisory only and never repository truth.

Do not plan a replacement architecture. Do not restart completed work. Do not create duplicate ownership. Continue the existing production-freeze program from verified repository state.

## 2. Repository and working branch

- Repository: `LalitDev2305/CarBroz-Customer-Backend`
- Working branch: `fix/stage-a-production-definitions`
- Sole normative architecture authority: `docs/MASTER-BACKEND-CONSTITUTION.md`
- Live execution status: `docs/PRODUCTION_FREEZE_EXECUTION.md`
- Freeze policy / Definition of Done: `docs/PRODUCTION_FREEZE_CONSTITUTION.md`
- Execution method: `docs/PRODUCTION_FREEZE_PLAYBOOK.md`
- Historical closeout evidence: `docs/PRODUCTION-ARCHITECTURE-CLOSEOUT-IMPLEMENTATION.md`

`PRODUCTION_FREEZE_CONSTITUTION.md` is a freeze contract only. It MUST NOT redefine architecture governed by `MASTER-BACKEND-CONSTITUTION.md`.

## 3. Source-of-truth precedence

When sources disagree, use this order:

1. `docs/MASTER-BACKEND-CONSTITUTION.md`
2. Live repository source at verified current branch HEAD
3. Executable architecture/contract tests and closeout transformation/gate behavior
4. Current CI, closeout and coverage evidence
5. `docs/PRODUCTION_FREEZE_EXECUTION.md`
6. `docs/PRODUCTION-ARCHITECTURE-CLOSEOUT-IMPLEMENTATION.md`
7. Audits, agent output, conversation history and memory

No lower source may override a higher source.

## 4. Mandatory startup protocol

Before any implementation change, every session MUST:

1. Verify repository identity and branch `fix/stage-a-production-definitions`.
2. Fetch the live branch HEAD. Never assume the SHA recorded in a document is still current.
3. Read this bootstrap completely.
4. Read `docs/MASTER-BACKEND-CONSTITUTION.md`.
5. Read `docs/PRODUCTION_FREEZE_EXECUTION.md` completely.
6. Read `docs/PRODUCTION_FREEZE_CONSTITUTION.md` and `docs/PRODUCTION_FREEZE_PLAYBOOK.md`.
7. Read the historical closeout ledger only when evidence/history is needed.
8. Inspect the latest normal CI for the live HEAD.
9. Inspect the latest legitimate closeout result and strict coverage evidence when relevant.
10. Verify the first unfinished task against live source before editing.
11. Read only the README/package/domain documentation relevant to files being modified; do not sweep unrelated documentation without a concrete need.

If live evidence invalidates the execution ledger, update the ledger first with the verified truth.

## 5. Frozen decision rule

No coding decision comes from memory, assumption, Copilot, ChatGPT, Antigravity or any other agent alone.

Every decision requires agreement between:

1. the Master Backend Constitution,
2. current source/final transformed-source evidence, and
3. executable validation.

If a decision conflicts with the Master Constitution, stop production implementation. Record the conflict and amend the Master Constitution intentionally together with its enforcement before proceeding. Never silently redesign around it.

## 6. Non-negotiable architecture rules

- Modular Monolith + DDD bounded contexts + Clean/Hexagonal dependency direction remain frozen.
- Final workspace roots are only `apps/*`, `domains/*`, `sdui/*`, `platform/*`, `foundation/*`.
- No final generic `packages`, `shared`, `common`, `libs`, generic SDK or utils ownership.
- `apps/api` is transport/composition only; no business authority, repositories or state machines.
- Partner, Customer and Admin transport/product surfaces remain isolated.
- SDUI Customer and Partner concerns remain independently scoped/versioned where required by the Master Constitution.
- Cross-domain dependencies use approved public boundaries.
- Infrastructure/vendor details do not leak inward into domain/application ownership.
- Execution actor is mandatory. Do not create anonymous/impossible actor states merely for coverage.
- Do not introduce event sourcing, a global Result/Either model, a DI framework, or another architecture mechanism merely because an audit or agent recommends it.
- Do not preserve dead or impossible code for compatibility without verified ownership need.

## 7. Current verified baseline at bootstrap creation

Bootstrap creation began from branch HEAD:

`b1d2e20bc7891ae26c928da7f8c469a2afced383`

That commit is `docs(architecture): add production closeout implementation ledger`.

Verified normal CI on that exact SHA:

- Workflow: `CarBroz Backend CI`
- Run: `33988490027` / #1321
- Result: SUCCESS
- Prisma validate/generate/migrations: PASS
- Build: PASS
- Lint: PASS
- Vitest: PASS

Latest canonical closeout baseline retained from closeout #116:

- architecture/transformation gates: PASS
- Prisma/build/lint/normal tests: PASS
- only failing gate: strict executable production coverage
- Statements: 82.10%
- Branches: 69.35%
- Functions: 91.53%
- Lines: 84.08%

These SHAs/runs are historical anchors, not permission to skip live verification.

## 8. Current vs transformed repository rule

The branch is still a transitional pre-closeout source. The closeout executor creates a final candidate and validates canonical topology. Therefore:

- never call a current transitional path a final architecture defect without tracing its closeout transformation;
- never patch only generated/transformed output when its true producer is current source or a transformation script;
- never create a duplicate final-path implementation because a final path does not yet exist in current source;
- coverage misses from a transformed candidate must be traced back to their real producer before editing.

## 9. Production-freeze milestones

There are exactly four execution milestones. Do not add new phases or restart them under different names.

1. **Milestone 1 — Repository Foundation & AI Operating System**
   Establish this bootstrap, freeze contract, live execution ledger, playbook, safe validation entry point and verified repository baseline.
2. **Milestone 2 — Repository Convergence**
   Reconcile live/current and transformed architecture with the Master Constitution; close only proven residual architecture defects.
3. **Milestone 3 — Production Convergence**
   Close real executable production gaps, especially strict coverage, by fixing semantics first and adding meaningful tests.
4. **Milestone 4 — Production Freeze**
   Prove final transformed topology, migrations, build, lint, tests, strict 100/100/100/100 coverage and all Constitution gates; remove one-time closeout tooling only after every required gate passes.

The authoritative task status is always `docs/PRODUCTION_FREEZE_EXECUTION.md`.

## 10. Implementation loop

The word **continue** means:

1. read/verify the bootstrap protocol,
2. locate the first unfinished execution-ledger task,
3. inspect its real owner and evidence,
4. implement the smallest root-cause change,
5. run the strongest available targeted validation,
6. run/confirm broader validation at the appropriate boundary,
7. update the execution ledger with exact evidence,
8. commit the coherent change,
9. continue to the next unfinished task unless blocked by a real architectural decision, permission failure or validation failure requiring investigation.

Do not respond to `continue` with a new plan when implementation can proceed.

## 11. Coverage law

The production freeze target is literal:

- Statements 100%
- Branches 100%
- Functions 100%
- Lines 100%

Forbidden shortcuts include threshold reduction, scope/exclusion weakening, coverage-ignore directives, fake tests, impossible object states, unsafe casts solely for coverage, private-method invocation solely for coverage, and preserving meaningless branches merely to test them.

For every gap: trace producer → classify gap → fix semantic/design defect if present → remove genuinely dead/unreachable logic when justified → add meaningful behavior tests → validate → record evidence.

## 12. CI and closeout discipline

Development should be local/targeted first whenever an execution environment is available. CI is final confirmation, not the primary debugging loop.

Do not create overlapping closeout-triggering commits while a closeout run is active because the workflow uses cancellation/concurrency behavior. Batch coherent closeout-triggering changes and let the canonical run finish.

Do not remove one-time closeout tooling or its workflow until strict coverage and every downstream freeze gate pass.

## 13. Required handoff discipline

At the end of every meaningful implementation batch, update `docs/PRODUCTION_FREEZE_EXECUTION.md` with:

- verified branch HEAD / implementation commit,
- task status,
- files/ownership changed,
- validation performed,
- CI/closeout run IDs when available,
- coverage delta when relevant,
- first unfinished task,
- any genuine blocker.

A task is not DONE because an agent says it is done. It is DONE only when repository evidence and required executable validation prove it.

## 14. Stop conditions

Stop and request a project-owner decision only when:

- the Master Constitution genuinely conflicts with required product behavior,
- two valid ownership models cannot be resolved from existing architecture evidence,
- a required external/business decision is absent,
- repository permissions prevent the required change,
- or validation exposes a defect whose correct resolution requires changing a frozen product/architecture decision.

Otherwise continue execution without asking for permission between ordinary tasks.
