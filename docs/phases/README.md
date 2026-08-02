# Phase Documentation

Every phase must now contain the following files in `docs/phases/phase-XX/`:
- `implementation_plan.md`
- `walkthrough.md`
- `release_notes.md`

**Note**: Architecture reviews must NOT be stored here.

## Expected Documents per Phase

### 1. `implementation_plan.md`
Created BEFORE coding begins. Must contain:
- Goal & Scope
- DB/API/Docker Changes
- Risks & Rollback strategies
- Acceptance criteria.
- **Must be approved before implementation starts.**

### 2. `walkthrough.md`
Created AFTER coding is complete. Must contain:
- Summary of the actual implementation.
- Breaking changes.
- Dependencies on future phases.

### 3. `release_notes.md`
Created alongside the walkthrough. Contains high-level notes for changelogs.
