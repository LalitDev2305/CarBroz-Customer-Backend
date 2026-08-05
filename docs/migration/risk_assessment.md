# Milestone 5 — Risk Assessment & Mitigation Plan

Risk evaluation for Milestone 5 (Legacy Pruning & Final Stabilization).

## 1. Identified Risks & Impact Analysis

| Risk ID | Risk Description | Severity | Likelihood | Mitigation Strategy |
|---|---|---|---|---|
| R1 | Unintentional deletion of legacy repositories used by unmigrated utilities | High | Low | Conduct full codebase search (`grep_search`) before deleting any file in `packages/database/src/repositories/` |
| R2 | Broken exports in `@carbroz/common` breaking legacy controllers | Critical | Low | Maintain all backward compatibility re-exports in `@carbroz/common/src/domain/` |
| R3 | Stale `dist/` artifacts causing build or test mismatches | Medium | Medium | Run `pnpm -r build` and `git clean -fd` between execution batches |

---

## 2. Emergency Rollback Plan

If any critical validation step fails during Phase 7 implementation:

```bash
git checkout feature/m5-legacy-pruning
git reset --hard HEAD
```
