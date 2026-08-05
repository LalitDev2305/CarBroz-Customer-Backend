# Milestone 5 — Validation Plan

Validation suite and verification protocols for Milestone 5 (Legacy Pruning & Final Stabilization).

## 1. Automated Validation Protocols

1. **Compilation Suite**: `pnpm -r build` (All 35 workspace projects must build cleanly with zero TS errors).
2. **Vitest Test Suite**: `pnpm test` (All 41+ test suites must pass 100% green).
3. **Linter Suite**: `pnpm lint` (Zero ESLint errors across the workspace).

---

## 2. Architectural Verification Protocols

1. **Clean Architecture Layering**: `apps` -> `domains` -> `platform` -> `shared`.
2. **Zero Schema Mutations**: Confirm `prisma/schema.prisma` is untouched.
3. **Public Barrel Boundary Control**: All cross-domain calls must route via `@carbroz/domain-<name>`.
