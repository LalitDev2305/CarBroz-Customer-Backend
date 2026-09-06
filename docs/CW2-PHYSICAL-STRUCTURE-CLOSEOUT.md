# CW2 — Physical Structure Closeout

**Status:** PASS  
**Scope:** Physical repository/workspace convergence and its permanent non-mutating verification only.  
**Validated implementation commit:** `d49e1daf2a8b8e3021dda7716ed74df7996e5ede`

## Proven invariants

- Root workspace taxonomy is physically limited to `apps/*`, `domains/*`, `sdui/*`, `platform/*`, and `foundation/*`.
- Exactly 23 canonical production workspaces are materialized and each canonical workspace has a root `README.md` documenting its ownership boundary.
- The legacy `packages/*` workspace authority is removed from `pnpm-workspace.yaml`, and the physical `packages/`, `shared/`, and `libs/` roots are absent.
- API business ownership under `apps/api/src/modules` is physically removed; `apps/api` remains transport/composition oriented.
- Transitional API roots `apps/api/src/modules`, `apps/api/src/providers`, `apps/api/src/container`, and `apps/api/src/context` are absent.
- API transport/composition surfaces remain under the canonical API structure, including `apps/api/src/surfaces` and bootstrap lifecycle infrastructure.
- SDUI has exactly the two canonical workspaces `sdui/ui-sdk` and `sdui/registry`.
- Permanent CI installs only from the committed dependency graph with `pnpm install --frozen-lockfile`.
- CW2 verification is read-only: it validates the persisted topology and never generates architecture source, refreshes the lockfile, commits, pushes, or deletes repository authorities.

## Permanent verification model

`tools/architecture-closeout.mjs` is now a verification-only CW2 guard. It checks canonical workspace/package documentation, forbidden transitional roots, the canonical pnpm workspace globs, and immutable CI installation semantics.

`.github/workflows/architecture-closeout.yml` is the dedicated **Backend Architecture Closeout Verifier**. It has read-only repository permissions and validates the exact candidate SHA through:

1. `pnpm install --frozen-lockfile`.
2. CW2 canonical topology verification.
3. Prisma validation and client generation.
4. PostgreSQL migration deployment.
5. Canonical monorepo build.
6. ESLint.
7. Full Vitest execution.
8. A final Git clean-tree proof demonstrating the closeout validation did not mutate tracked source.

The permanent `.github/workflows/ci.yml` independently applies the same immutable dependency and CW2 topology guard before its Prisma, build, lint, test, and non-mutation gates.

## Executable closeout evidence

The validated implementation commit `d49e1daf2a8b8e3021dda7716ed74df7996e5ede` passed both independent workflows on September 6, 2026:

- **CarBroz Backend CI #1380** — run `34026532296` — **SUCCESS**.
- **Backend Architecture Closeout Verifier #123** — run `34026532289` — **SUCCESS**.

Across those exact-SHA runs, the frozen lockfile installation, CW2 verifier, Prisma validation/generation/migrations, build, lint, full Vitest suite, and non-mutating clean-tree checks all passed.

The earlier one-time topology materializer is not a permanent repository authority. The surviving closeout tooling is verification-only and cannot rewrite the architecture.

## Boundary

CW2 closes physical structure convergence and its permanent verification contract. It does **not** declare the entire production architecture freeze complete. Business-boundary, security, production-readiness, strict coverage, and final freeze gates remain governed by their later closeout workstreams and must not be inferred as PASS from this document.

CW3 and later workstreams are intentionally untouched by this closeout record.
