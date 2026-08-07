---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 02 Development Workflow

> [!IMPORTANT]
> The following 8-step lifecycle must be executed for EVERY development phase.

## The 8-Step Lifecycle

1. **Analysis**
   - Review current project state. Understand affected files and architecture context.

2. **Implementation Plan Generation & Approval**
   - Create a detailed plan specifying scope, APIs, DB changes, Risks, and Rollback strategies.
   - **WAIT FOR APPROVAL** before writing code.

3. **Implementation**
   - Implement exactly the approved scope. No ad-hoc refactoring. No architectural workarounds.

4. **Self Review**
   - Thorough self-audit of code logic and boundaries.

5. **Verification**
   - Code must successfully run: `build`, `lint`, `type check`, and `test`.

24. **Architecture Review**
    - Verify zero violations against Clean Architecture, SOLID, and the Provider Pattern.

27. **Generate**
    - `walkthrough.md`
    - `release_notes.md`

30. **Architecture Review & Merge Readiness**
    - Generate `phase-XX-review.md` in `docs/reviews/`
    - Update `PROJECT_STATUS.md`
    - Mark phase as **Ready for Merge**.
