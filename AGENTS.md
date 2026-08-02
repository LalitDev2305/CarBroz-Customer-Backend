---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# CarBroz AI Coding Agent Rules

> [!CAUTION]
> This file instructs every AI coding agent. You MUST strictly abide by the rules outlined below when interacting with this workspace.

## Core Directives

> [!CAUTION]
> The architecture documents are frozen. Do not modify them unless explicitly instructed. Any architecture change requires an ADR. Implementation must never silently modify architecture documentation.

**Before implementing any phase, READ:**
- `docs/architecture/00_ENGINEERING_STANDARDS.md`
- `docs/architecture/01_ARCHITECTURE_BLUEPRINT.md`
- `docs/architecture/02_DEVELOPMENT_WORKFLOW.md`
- `docs/architecture/03_EXECUTION_ROADMAP.md`
- `docs/architecture/04_DYNAMIC_UI_SPECIFICATION.md`

**Then generate implementation_plan.md. Never skip this.**

1. **Read Engineering Standards first.** Review `docs/architecture/00_ENGINEERING_STANDARDS.md`.
2. **Read Architecture Blueprint.** Review `docs/architecture/01_ARCHITECTURE_BLUEPRINT.md`.
3. **Follow Development Workflow.** The 8-step workflow defined in `docs/architecture/02_DEVELOPMENT_WORKFLOW.md` is mandatory.
4. **Never change SDUI JSON hierarchy.** `docs/architecture/04_DYNAMIC_UI_SPECIFICATION.md` strictly locks this.
5. **Never violate Clean Architecture.**
6. **Never bypass Provider Pattern.**
7. **Never implement before approved implementation_plan.md.**
8. **Never modify unrelated files.**
9. **Always generate walkthrough.md.**
10. **Always generate review.md.**
11. **Always run build, lint and tests** before marking readiness.
12. **Always maintain backward compatibility.**
13. **Always use feature branches.**
14. **Never commit directly to integration or main.**

By operating in this workspace, you agree that these rules are permanent and immutable.
