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

Documentation MUST NOT legitimize a bad structure. If an artifact cannot be documented consistently with the Master Constitution, that is an architecture defect and the defect must be fixed before documenting the final state.

## Canonical TypeScript documentation format

Use TSDoc-compatible `/** ... */` comments for exported production symbols and meaningful internal symbols.

Document:

- exported classes, interfaces, types, enums, functions, factories and providers;
- application use cases and domain services;
- domain aggregates, entities, value objects and policies;
- ports and adapters;
- registries, builders, factories, validators and serializers;
- infrastructure implementations with meaningful behavior;
- non-obvious internal functions that enforce invariants or dependency boundaries.

Avoid comments that merely restate syntax.

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

Every production workspace package and substantial bounded context MUST contain a README once it has meaningful implementation. The README should explain:

- purpose and ownership;
- what the package owns;
- what it does not own;
- inbound consumers;
- outbound dependencies;
- public API/ports;
- forbidden dependency directions;
- extension/provider model;
- test strategy;
- important operational or security constraints.

Do not create empty ceremonial folders solely to satisfy documentation structure.

## Function-level documentation

Every exported production function MUST have TSDoc unless its behavior is fully obvious from a documented interface it implements. Internal functions require documentation when they:

- enforce a business or structural invariant;
- perform security-sensitive work;
- transform external-provider data;
- participate in transactions/idempotency/retries;
- establish an architectural boundary;
- contain non-obvious algorithmic behavior.

Private trivial getters/setters and obvious local helpers do not require redundant comments.

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
```

If ownership or dependency direction is unclear, stop and resolve the architecture before writing final documentation.

## Change review rule

A production change is incomplete when it introduces or materially changes an architectural responsibility without updating the corresponding TSDoc/README documentation.
