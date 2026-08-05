# Milestone 2 — Risk Assessment & Mitigation Strategies

Risk evaluation and mitigation protocols for migrating Core Business Domains (`identity`, `customer-profile`, `address`, `partner-profile`, `partner-kyc`, `catalog`, `pricing`, `garage`).

## Risk Matrix

| Risk ID | Risk Category | Severity | Probability | Risk Description | Mitigation Strategy |
|---|---|---|---|---|---|
| **R-01** | Imports | High | Low | Deep import breakage during domain extraction | Re-export all domain models through `@carbroz/common` compatibility barrels during extraction |
| **R-02** | DI Container | Medium | Low | Awilix DI key collision during module registration | Scope DI registration keys using domain prefix (e.g. `identityUserRepository`) |
| **R-03** | Compilation | Medium | Low | `verbatimModuleSyntax` TS errors in extracted domain use-cases | Enforce type-only imports for interfaces in domain module files |
| **R-04** | SDUI Registry | Low | Low | Loss of `AuthLoginBuilder` in SDUI engine | Keep `AuthLoginBuilder` re-exported from `domains/identity/public/index.ts` |

---

## Safety & Rollback Protocols

1. **Non-Destructive Extraction**:
   - Create new domain target directories under `domains/<domain>/`.
   - Copy domain implementations and verify `pnpm -r build` and `pnpm test`.
   - Re-export extracted symbols through `@carbroz/common`.
2. **Rollback Guarantee**:
   - `git restore <specific-path>` or `git checkout feature/m1-shared-kernel-platform` if any regression occurs.
