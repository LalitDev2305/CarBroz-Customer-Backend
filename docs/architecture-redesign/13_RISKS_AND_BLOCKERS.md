# 13 — Risks, Mitigations & Rollback Strategy

## 1. Technical Risk Identification & Mitigations

| Risk | Likelihood | Impact | Mitigation Strategy |
|---|---|---|---|
| Broken Imports during file movement | High | Medium | Use TypeScript compiler path aliases and re-export barrels during transition milestones. |
| Awilix DI Cradle binding mismatch | Medium | High | Maintain strict constructor parameter naming standards and run full integration test suite after each feature move. |
| Test suite path breakage | Medium | Low | Co-locate unit tests inside feature folders (`features/<feature>/tests/`) and update Vitest `include` patterns. |
| Circular package dependencies | Low | High | Enforce acyclic imports: Feature packages import only `common-kernel`, `database`, `ui-sdk`. Feature packages never import each other's internal implementations. |

---

## 2. Rollback Strategy
Each milestone is committed as an isolated Git commit on `feature/architecture-stabilization`. If any milestone fails verification (`pnpm test`), `git reset --hard` reverts the working tree to the previous green milestone instantly.
