# CarBroz Backend Engineering Documentation Standard

> **Authority:** This document is subordinate to `docs/MASTER-BACKEND-CONSTITUTION.md`. It explains how to document code without changing architectural ownership rules.

## Purpose

Backend documentation is part of architecture enforcement. Documentation MUST help a developer answer:

- Why does this artifact exist?
- Which bounded context/package owns it?
- Who is allowed to call it?
- What may it depend on?
- What must it never own or depend on?
- What invariant, contract, lifecycle, or side effect does it protect?
- How may it be extended or replaced safely?
- Which executable tests prove the behavior?
- What exact command runs the module, class/function, regression, integration, and freeze verification?

Documentation MUST NOT legitimize a bad structure. If an artifact cannot be documented consistently with the Master Constitution, that is an architecture defect and the defect must be fixed before documenting the final state.

## Canonical TypeScript documentation format

Use TSDoc-compatible `/** ... */` comments for production classes/functions and exported production vocabulary.

The frozen architecture requires documentation for:

- every production class;
- every named production function declaration;
- every class constructor, method, getter, setter, and function-valued class property;
- exported function-valued constants;
- exported interfaces, types, enums, factories and providers;
- application use cases and domain services;
- domain aggregates, entities, value objects and policies;
- ports and adapters;
- registries, builders, factories, validators and serializers;
- infrastructure implementations with meaningful behavior;
- non-obvious internal functions that enforce invariants or dependency boundaries.

Avoid comments that merely restate syntax. Documentation must explain architectural intent, owner, role, important boundary/non-responsibility, invariant, or failure semantics as applicable.

Bad:

```ts
/** Returns the user. */
function getUser() {}
```

Useful:

```ts
/**
 * Resolves the authenticated identity exposed by the Identity public contract.
 *
 * @remarks
 * Customer consumes only the stable identity reference. Customer must not
 * import Identity persistence or authentication internals.
 */
function resolveCustomerIdentity() {}
```

## Required architectural content

For important classes/modules, documentation should state the following when applicable:

1. **Owner** — bounded context/package.
2. **Role** — domain, application, port, adapter, transport, composition, platform, foundation or SDUI.
3. **Callers** — expected inbound consumers.
4. **Dependencies** — approved outbound dependencies.
5. **Non-responsibilities** — nearby concerns explicitly owned elsewhere.
6. **Invariants** — rules this code must preserve.
7. **Extension model** — how new behavior is added without modifying unrelated existing code.
8. **Failure semantics** — important errors, retries, idempotency or transaction behavior.

## Package and bounded-context README requirement

Every production workspace package and substantial bounded context MUST contain a README once it has meaningful implementation. The README must explain:

- purpose and ownership;
- what the package owns;
- what it does not own;
- inbound consumers;
- outbound dependencies;
- public API/ports;
- forbidden dependency directions;
- extension/provider model;
- existing executable test files and named test cases;
- the complete positive/negative/regression/integration/provider/repository/security/E2E test matrix applicable to the module;
- exact commands for running the module tests and each discovered test file;
- class/function-specific verification guidance, including an explicit warning when only freeze-wide reachability exists and a focused test is still required before changing that symbol;
- the full repository freeze command (`pnpm test:freeze`);
- important operational or security constraints.

A freeze-wide runtime sweep is supporting evidence, not a replacement for focused tests of important business invariants, provider contracts, persistence behavior, security rules, or fixed defects.

Do not create empty ceremonial folders solely to satisfy documentation structure.

## Function-level documentation

Every production class and named production function MUST carry TSDoc architectural intent. Every constructor and class operation MUST be documented so maintainers can understand why the operation exists and which boundary it must preserve.

Exported interfaces/types/enums also require TSDoc because they form vocabulary or contract surfaces. Trivial syntax must not receive misleading prose; where behavior is simple, document ownership and non-responsibility rather than restating the implementation.

## Test documentation and executable proof

Documentation is only considered current when it can be used to execute the proof it describes.

For each documented module:

1. Discover colocated tests and cross-repository tests that import/reference the module or its production symbols.
2. List literal `it(...)` / `test(...)` cases where they can be discovered statically.
3. Provide an exact `pnpm exec vitest run <test-file>` command for every listed test file.
4. Provide one command that runs all tests discovered for the module.
5. Provide module build/lint commands when the module is a workspace package.
6. State database prerequisites for database-backed integration tests.
7. Map concrete top-level classes/functions to focused tests when such tests exist.
8. If a concrete symbol has no direct-name/source behavioral test, say so explicitly; do not imply that broad coverage alone proves its business behavior.
9. Keep the reproducing test for every production bug permanently.
10. Keep `pnpm test:freeze` as the final strict executable-production verification command.

Generated module documentation and permanent architecture policy tests MUST fail CI when these sections disappear.

## Documentation as an architecture audit gate

Before documenting an existing artifact, classify it:

```text
WHY does it exist?
WHO owns it?
WHO calls it?
WHAT may it depend on?
WHAT must not depend on it?
IS another artifact already doing the same job?
DOES it violate SRP?
DOES it cross a bounded-context boundary?
DOES it create a dependency cycle?
IS the abstraction solving a real replacement/extension problem?
WHICH focused test proves the important behavior?
HOW is that test executed directly?
```

If ownership or dependency direction is unclear, stop and resolve the architecture before writing final documentation. If important behavior has no focused executable test, add the test before declaring that behavior frozen.

## Change review rule

A production change is incomplete when it introduces or materially changes an architectural responsibility without updating the corresponding TSDoc, README, test inventory, and executable verification guidance.
