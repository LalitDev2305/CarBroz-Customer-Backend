# CW2 — Physical Structure Convergence Closeout

**Status:** COMPLETE  
**Architecture authority:** `docs/MASTER-BACKEND-CONSTITUTION.md`  
**Live continuation:** `docs/PRODUCTION_FREEZE_EXECUTION.md`

CW2 converged the checked-in repository to the frozen physical taxonomy and established permanent read-only protection against physical drift. This document records closeout evidence; it does not redefine the Master Constitution.

## 1. Exit rule

CW2 is complete only when the checked-in repository itself, not a temporary transformed candidate, satisfies the frozen physical structure and its permanent verifier is read-only.

Required outcome:

- exact canonical production workspaces;
- exact canonical workspace globs;
- no transitional top-level production authorities;
- exact canonical `apps/api/src` roots;
- API remains transport/composition only;
- canonical workspace documentation exists;
- permanent CI uses immutable installation;
- validation does not rewrite tracked source;
- CW1 enforcement survives CW2 without reintroducing mutating convergence behavior.

## 2. Final checked-in physical topology

### Production workspaces

Exactly 23 production workspaces are canonical:

```text
apps/api

domains/identity
domains/partner
domains/customer
domains/catalog-pricing
domains/booking
domains/operations
domains/financials
domains/communications
domains/engagement
domains/configuration
domains/dispute
domains/enterprise
domains/audit

sdui/ui-sdk
sdui/registry

platform/database
platform/cache
platform/messaging
platform/storage
platform/observability
platform/integrations

foundation/kernel
```

`pnpm-workspace.yaml` is permanently required to contain exactly:

```text
apps/*
domains/*
sdui/*
platform/*
foundation/*
```

`packages`, `shared`, `libs`, `common` are not valid production ownership roots.

### API source roots

`apps/api/src` contains exactly:

```text
bootstrap/
surfaces/
system/
transport/
```

Canonical bootstrap entry points are under `apps/api/src/bootstrap`. Partner, Customer and Admin are isolated under `apps/api/src/surfaces`.

Legacy root authorities such as root `app.ts`/`server.ts`, `modules`, `providers`, root `container`, root `context`, root `config`, root controllers/middlewares/plugins and API-owned business repositories/use cases are forbidden.

## 3. Permanent CW2 verifier

`tools/architecture-closeout.mjs` is the permanent CW2 physical verifier. It is read-only and enforces:

- exact 23 production workspaces;
- README + package manifest for each canonical workspace;
- exact five workspace globs;
- exact four API source roots;
- canonical API bootstrap/surface directories and entry points;
- absence of transitional roots/legacy API authorities;
- frozen-lockfile installation in permanent CI;
- presence of the permanent CW1/CW2 Constitution regression gate in both CI and architecture closeout workflows.

The verifier does not move source, generate documentation, rewrite imports or delete files.

## 4. CW1/CW2 enforcement reconciliation

A post-closeout double-check found an important control-plane seam: the historical Constitution closeout gate still imported source-rewriting convergence producers, while permanent CI no longer invoked it.

The correction did **not** redo CW2 physical architecture.

`tools/architecture-closeout-constitution-gate.mjs` is now read-only in all modes:

- `--regression` protects already-closed CW1/CW2 invariants and permits only exact documented later-workstream blocker paths;
- default/full mode has no exceptions and remains the fail-closed CW3-CW6/final-freeze gate.

Normal CI, architecture closeout verification and freeze preflight use regression mode. The full gate remains intentionally capable of failing on genuine later-workstream blockers.

Dormant historical source-rewriting scripts may remain temporarily for forensic traceability, but they are not permanent validation entry points and are not executed by the CW2 verifier, normal CI or freeze preflight.

## 5. Validation evidence

### Physical implementation boundary

Commit:

`d49e1daf2a8b8e3021dda7716ed74df7996e5ede`

Validated by:

- CarBroz Backend CI #1380 / run `34026532296` — SUCCESS.
- Backend Architecture Closeout Verifier #123 / run `34026532289` — SUCCESS.

### Initial closeout documentation boundary

Commit:

`841c4bd6ae27cc36e89d855e04ac2426d04065d7`

Validated by:

- CarBroz Backend CI #1381 / run `34026647557` — SUCCESS.
- Backend Architecture Closeout Verifier #124 / run `34026647579` — SUCCESS.

### Enforcement audit diagnostic

Commit:

`8f3f4bfdea40eafa18b0547f8d428514d899984c`

Backend Architecture Closeout #125 / run `34027399905` correctly proved:

- the strengthened CW2 physical verifier passed;
- the newly read-only **full** Constitution gate exposed genuine later-workstream blockers in Enterprise accounting ownership, Identity security and observability;
- therefore those later blockers must not be misclassified as CW2 physical failures.

### Final CW1/CW2 enforcement reconciliation

Commit:

`37cb1c1ff8fb025d94d5f9107a6abae0639ff904`

Validated by:

- **CarBroz Backend CI #1383 / run `34027645386` — SUCCESS**.
- **Backend Architecture Closeout Verifier #126 / run `34027645311` — SUCCESS**.

Both passed:

1. immutable dependency installation;
2. exact CW2 topology verification;
3. CW1/CW2 read-only Constitution regression gate;
4. Prisma validate;
5. Prisma generate;
6. PostgreSQL migrations;
7. build;
8. lint;
9. full Vitest;
10. post-test regression gate;
11. clean tracked-source proof.

## 6. What CW2 does not claim

CW2 completion does **not** claim that:

- Enterprise/Financials ownership is fully converged;
- all cross-domain/public boundaries are semantically complete;
- Identity production OTP/session security is hardened;
- all observability/PII rules are complete;
- transactions/concurrency/financial invariants are fully proven;
- strict production coverage is 100/100/100/100;
- the default/full Constitution gate is green;
- the backend is production-frozen.

Those remain CW3-CW6 responsibilities.

## 7. Closeout decision

**CW2 is COMPLETE.**

The checked-in repository is the canonical physical development baseline. Permanent CW2/CW1 regression validation is exact, immutable and read-only. The next workstream is **CW3 — Bounded-Context & Dependency Convergence**, beginning with Enterprise corporate invoice/payment-accounting ownership that must move to Financials without duplicate authority.
