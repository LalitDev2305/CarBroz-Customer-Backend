# SDUI V3 Architecture Freeze Gates

Status: **NOT FROZEN**

The canonical SDUI V3 structural hierarchy is:

- `Template -> Component -> Element`
- `Template -> Component -> Section -> Element`
- `Template -> Component -> Section -> Group -> Element`

`Component` and `Element` are mandatory. `Section` and `Group` are optional structural levels. A component selects exactly one branch: direct elements or sections. A section selects exactly one branch: direct elements or groups. `Element` is always a leaf and must never contain structural children.

## Freeze requirements

The SDUI engine may be marked frozen only after all of the following are proven from repository evidence and executable validation:

1. `packages/sdui-engine` is the only canonical SDUI contract authority.
2. No legacy `ui-sdk`, duplicate schema, duplicate structural model, or application/domain-owned canonical SDUI contract remains authoritative.
3. All canonical collections that must contain content are non-empty.
4. Branch exclusivity is enforced at Component and Section levels.
5. Element leaf semantics are enforced.
6. Structural IDs are non-blank and unique across an entire screen document.
7. Template identity and target-app invariants are enforced.
8. Unknown structural properties are rejected unless explicitly part of the versioned contract.
9. Public exports expose only canonical V3 APIs and do not leak internal implementation details.
10. Malformed runtime payloads fail through the validator boundary with deterministic errors.
11. Tests cover multiple components, sections, groups, and elements in valid mixed hierarchy combinations.
12. Tests cover adversarial invalid nesting and malformed payloads.
13. Workspace installation succeeds with a frozen lockfile and no broken local-link dependencies.
14. Generated build output is not tracked as source.
15. Repository build, lint, tests, and coverage gates pass for the migration state required by the architecture milestone.

No later feature/domain implementation may redefine this hierarchy. Changes to the canonical hierarchy require an explicit architecture decision and versioned contract migration.
