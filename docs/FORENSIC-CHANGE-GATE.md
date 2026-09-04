# CarBroz Backend Forensic Change Gate

> **Authority:** This operational gate is subordinate to `docs/MASTER-BACKEND-CONSTITUTION.md`. It does not redefine architecture; it makes the Constitution's no-drift, testing, migration and freeze requirements mandatory between implementation slices.

## Purpose

Every architecture-sensitive change must be reviewed twice before work proceeds to the next implementation slice. A successful edit or green local-looking test is not enough. The second pass must inspect the changed area and the repository-wide consequences of that change.

The goal is to prevent iterative architecture drift, hidden duplication, accidental coupling and regressions that are discovered only several phases later.

## Mandatory two-pass rule

### Pass 1 — implementation verification

Immediately after a coherent implementation slice:

1. Re-read every changed production file and its adjacent public contracts.
2. Verify the implementation still matches the Master Constitution and the intended bounded-context owner.
3. Verify SRP, dependency inversion, public-boundary usage and provider/adapter ownership.
4. Check positive, negative, edge, failure and regression tests relevant to the change.
5. Verify TSDoc/README documentation describes the corrected architecture rather than legitimizing a legacy structure.
6. Run the applicable build, lint, typecheck, schema validation and test suite.
7. Correct any defect found in this pass before continuing.

### Pass 2 — repository-wide forensic verification

Before starting the next slice, inspect the whole repository for consequences and related defects. At minimum verify:

- no duplicate implementation or competing authority was introduced;
- no old implementation was left active when a replacement became canonical;
- no new `common`, `shared`, generic `packages`, helper or utility ownership leaked in;
- no API transport module acquired business logic;
- no Platform package acquired CarBroz business rules;
- no domain imports another domain's internals instead of its public contract;
- no Partner, Customer or Admin surface isolation was weakened;
- no circular dependency or newly forbidden dependency direction was introduced;
- no provider-specific SDK/model leaked into business/application contracts;
- no SDUI hierarchy, definition, scope or publication rule drifted;
- workspace/package topology still matches the current migration allowlist and moves closer to the final Constitution topology;
- tests and documentation moved with their owning responsibility;
- change blast radius remains narrow and future extension/replacement remains additive where designed.

If this review reveals a related structural defect, classify it using the Constitution's `KEEP`, `MOVE`, `MERGE`, `RENAME` or `DELETE` migration vocabulary and resolve it in the current convergence plan rather than ignoring it as unrelated cleanup.

## No-next-slice law

The next architecture-sensitive implementation slice MUST NOT begin until:

- the latest coherent slice passes its applicable CI/build/lint/tests;
- the changed code has been re-read after implementation;
- repository-wide boundary/topology scans show no newly introduced violation;
- any regression caused by the slice is fixed;
- the migration/convergence evidence is updated where ownership changed.

A temporarily failing intermediate commit is acceptable during one coherent slice, but the slice itself is not complete and the next slice must not start while the latest validation remains red.

## Forensic review questions

For every important artifact encountered during the second pass, ask:

```text
WHY does this exist?
WHO owns it?
WHO calls it?
WHAT may it depend on?
WHAT must it never depend on?
IS there another implementation of the same responsibility?
IS this business, application, transport, platform, foundation or SDUI code?
DOES it violate SRP or bounded-context ownership?
DOES it expose implementation details across a public boundary?
DOES it create or participate in a dependency cycle?
CAN a provider or strategy be replaced without changing unrelated consumers?
CAN a new supported variant be added without modifying unrelated existing behavior?
ARE pass and fail behavior both protected by tests?
IF this changes tomorrow, what is the blast radius?
```

An answer that cannot be made unambiguous is evidence of an architectural defect, not a reason to add a vague comment or another abstraction.

## Evidence expected before architecture freeze

Forensic review evidence must ultimately demonstrate all of the following across the repository:

- canonical physical ownership;
- no duplicate authorities or compatibility God packages;
- stable public contracts;
- no forbidden cycles/imports;
- replaceable external providers behind stable ports;
- additive SDUI extension behavior;
- strong positive/negative/regression/failure test coverage;
- TSDoc and package/module READMEs that explain ownership and dependency direction;
- green fresh install, Prisma validation/generation, build, lint and test execution;
- a clean architecture-freeze result matching the Master Constitution.
