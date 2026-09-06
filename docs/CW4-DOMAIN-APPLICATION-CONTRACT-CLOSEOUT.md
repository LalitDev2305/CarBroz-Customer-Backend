# CW4 — Domain/Application Contract Convergence Closeout

**Status:** COMPLETE  
**Architecture authority:** `docs/MASTER-BACKEND-CONSTITUTION.md`  
**Live continuation:** `docs/PRODUCTION_FREEZE_EXECUTION.md`

CW4 closes semantic domain/application contract convergence for the currently implemented critical backend flows. It does not claim CW5 security/infrastructure production hardening, CW6 proof/coverage completion, a fully green default/full Constitution gate, or final production freeze.

## 1. Exit rule

CW4 is complete only when the implemented semantic contract surface satisfies all of the following without weakening CW1-CW3:

- application services orchestrate while domain objects own invariants/state transitions;
- authenticated authority flows through mandatory `ExecutionContext.actor` where applicable rather than raw caller-supplied authority flags/IDs;
- business-time decisions use the Foundation Clock abstraction instead of direct wall-clock reads in domain/application code;
- expected domain/application failures use typed domain error semantics rather than generic `Error`;
- the universal transaction callback receives a required transaction-bound context;
- repositories participating in a transaction use the same underlying database transaction resource;
- critical Booking conflict-check/create and batch-expiry operations are atomic;
- a real PostgreSQL rollback integration test proves the Booking repository uses the exact transaction-bound Prisma client;
- the CW4 verifier is read-only/fail-closed and permanently enforced before and after validation in normal CI, architecture closeout and production-freeze preflight;
- the exact canonical implementation SHA passes normal CI and Architecture Closeout completely.

## 2. Universal execution and transaction contracts

CW4 converged Foundation application primitives so they are explicit and transport-neutral:

- `ExecutionContext` carries correlation metadata plus a required `ActorContext`;
- `IUseCase.execute(input, context)` requires `ExecutionContext` rather than accepting optional execution authority;
- `TransactionContext` is a stable opaque universal contract containing the transaction-bound resource;
- `ITransactionProvider.runInTransaction` requires the callback to receive that transaction context;
- `IClockProvider` is the universal business-time port, with `SystemClock` as the production wall-clock implementation behind the abstraction.

Foundation remains universal: no Booking, Partner, Customer, Payment or other business model was moved into the kernel.

## 3. Domain/application semantic convergence

The CW4 implementation swept the implemented domain/application surfaces and removed the contract classes specifically targeted by the workstream:

- direct `Date.now()` / zero-argument `new Date()` business-time reads in domain/application semantic layers are rejected by the permanent gate;
- expected domain/application failures expressed as `throw new Error(...)` are rejected by the permanent gate;
- Booking authorization/state commands no longer accept raw `actorId` / `isAdmin` as independent authority seams; authorization derives from `ExecutionContext.actor`;
- Booking aggregate methods remain the owner of state transitions while application use cases orchestrate repositories, authorization and cross-context calls;
- Operations assignment/tracking continues to consume the already-frozen Booking/Partner public boundaries rather than reopening CW3 ownership.

CW4 did not redesign bounded contexts, add a global Result/Either architecture, introduce event sourcing, or create duplicate compatibility authorities.

## 4. Transaction propagation and Booking atomicity

`platform/database/src/providers/PrismaTransactionProvider.ts` now executes the callback inside the real Prisma `$transaction` and wraps the exact Prisma transaction client in the universal `TransactionContext`.

`domains/booking/infrastructure/repositories/PrismaBookingRepository.ts` resolves its persistence client from that context whenever a transaction is supplied. Therefore a repository call inside the transaction callback uses the same underlying Prisma transaction rather than silently falling back to the root client.

Implemented critical Booking flows were converged so:

- service-slot conflict detection and Booking creation execute within one Serializable transaction;
- pending-expiry discovery and all corresponding Booking updates execute within one explicit transaction;
- transaction context is propagated through the Booking repository contract rather than being ignored by the adapter.

This satisfies the CW4 portion of Constitution §§37 and 40 for the implemented critical Booking flow.

## 5. Real PostgreSQL rollback proof

`tests/integration/booking-transaction-rollback.integration.test.ts` is the executable rollback proof required by CW4.

The test:

1. uses the real `PrismaTransactionProvider`;
2. uses the real Booking-owned `PrismaBookingRepository`;
3. performs a Booking create through the transaction-bound repository client;
4. reads that Booking successfully from inside the same transaction;
5. throws an intentional rollback error;
6. reads from the root Prisma client after rollback and proves the created Booking is absent.

During this proof CW4 discovered that the currently deployed historical Prisma migration chain does not fully materialize the Booking persistence types represented by the current Prisma schema. To keep the rollback proof focused on transaction propagation, the integration test creates a faithful isolated PostgreSQL `BookingStatus` enum and `bookings` table only when they are absent, and removes only fixtures it created.

This fixture is not a fake transaction, not an in-memory substitute, and not a waiver of migration correctness: the write/read/rollback path still uses the real Prisma provider, real Booking repository and real PostgreSQL transaction. The schema/migration completeness defect is explicitly carried into CW5 infrastructure hardening and must be repaired additively without rewriting already-applied migrations.

## 6. Permanent CW4 verifier

`tools/cw4-contract-gate.mjs` is the permanent read-only CW4 verifier.

It fails on the CW4 regression classes including:

- optional `ExecutionContext` use-case contracts;
- unstable/unknown or optional transaction callback context;
- direct wall-clock reads in domain/application semantic layers;
- generic expected `Error` failures in those layers;
- raw Booking `actorId` / `isAdmin` authority seams;
- Booking transaction ports that omit transaction-bound context;
- slot conflict checks outside the transaction that creates the Booking;
- batch expiry writes without an explicit transaction;
- absence of a real Booking/PostgreSQL rollback proof using the real transaction provider and repository.

It is enforced:

- before and after validation in `.github/workflows/ci.yml`;
- before and after validation in `.github/workflows/architecture-closeout.yml`;
- before and after build/test validation in `tools/production-freeze/preflight.mjs`.

The verifier does not rewrite source, create migrations, change imports, generate compatibility layers or mutate the working tree.

## 7. Exact executable validation evidence

### Isolated implementation proof

Commit:

`438e95fa01a1d15dfa3b7427f10185adc656d469` — `test(cw4): mirror Booking enum in rollback fixture`

Validated first on the isolated CW4 worker branch by:

- **CarBroz Backend CI #1404 / run `34038678834` — SUCCESS**.

That run passed immutable installation, CW2, CW1/CW2 regression, CW3, CW4 pre-validation, Prisma validate/generate/migrate, monorepo build, ESLint, the complete Vitest suite including the real PostgreSQL rollback proof, post-validation CW1/CW2 + CW3 + CW4 gates, and clean-tree verification.

### Canonical implementation boundary

The worker SHA was then fast-forwarded unchanged to `fix/stage-a-production-definitions`; no force push or synthetic merge was used.

The same exact SHA was independently validated on the canonical branch by:

- **CarBroz Backend CI #1405 / run `34038797263` — SUCCESS**;
- **Backend Architecture Closeout Verifier #135 / run `34038797224` — SUCCESS**.

Both canonical workflows passed CW1-CW4 verification, Prisma validate/generate/migrate, build, lint, full Vitest, post-validation CW1-CW4 re-verification and clean/read-only source proof.

## 8. What CW4 does not claim

CW4 completion does **not** claim that:

- production OTP/session security is complete;
- config/secrets unsafe-production rejection behavior is complete;
- resource-ownership/public-ID authorization is fully audited;
- provider failures, observability and PII redaction are fully production-hardened;
- financial ledger/payout/refund/settlement idempotency and double-entry invariants are fully proven;
- the current Prisma schema and deployed migration history are fully reconciled;
- all SDUI version/immutability behavioral proof is complete;
- the default/full Constitution gate is green;
- strict executable production coverage is 100/100/100/100;
- the backend is production-frozen.

Those remain CW5-CW6 responsibilities.

## 9. Closeout decision

**CW4 is COMPLETE / CLOSED / PERMANENTLY ENFORCED at the implementation boundary `438e95fa01a1d15dfa3b7427f10185adc656d469`.**

The closeout documentation commit itself must pass the same exact-SHA normal CI and Architecture Closeout workflows before this documentation state is treated as the canonical handoff.

The first unfinished workstream after that documentation validation is **CW5 — Security/Infrastructure Production Hardening**.
