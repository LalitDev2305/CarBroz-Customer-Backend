---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 09 Branching Strategy

## Git Flow
The project follows a strict integration branch pattern.
- `backend-production-foundation`: The main integration branch for the current modernization initiative.
- `main`: Reflects the live production state (do not merge into this directly).

## Feature Branches
- Branch off the integration branch.
- Naming format: `feature/phase-[number]-[name]` or `fix/[number]-[name]`.

## Conventions
- **Commit Naming**: Conventional Commits required (`feat:`, `fix:`, `chore:`, `refactor:`).
- **PR Naming**: Match the feature branch intent. Link to the relevant Phase in the description.

## Merge Rules
- **Never commit directly** to the integration or main branch.
- PRs require passing CI pipelines (Build, Lint, Test).
- Code reviews must verify compliance with Architecture rules before approval.

## Release Rules
- Releases are tagged and pushed from the integration branch to `main` only after full QA sign-off.
