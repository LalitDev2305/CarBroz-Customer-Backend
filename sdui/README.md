# CarBroz SDUI Documentation Authority Map

> **Status:** ACTIVE — read this before changing SDUI code.

This file identifies the current SDUI implementation authorities and separates them from historical migration evidence.

## 1. Current read order

For implementation, use this order:

```text
1. SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md
2. PARTNER-AUTH-SDUI-CONTRACT.md                 // Login / OTP behavior
3. docs/PARTNER-AUTH-SDUI-MVI-UDF-HANDOFF.md
4. docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md
5. docs/MASTER-BACKEND-CONSTITUTION.md
6. executable architecture / freeze gates
```

If a historical document describes a different builder, package, hierarchy, screen owner, or file path, it does not override this architecture.

The Master Backend Constitution and the frozen SDUI implementation plan are now reconciled to the same physical topology and ownership model: `sdui/engine` is canonical and the standalone `sdui/registry` is retained only for concrete persisted lifecycle/version responsibilities.

## 2. Permanent SDUI authority

`sdui/engine` is the sole SDUI language, composition, definition, validation and screen-composition authority.

It owns:

- `Screen`, `Template`, `Component`, `Section`, `Group`, `Element` contracts;
- `action.*` and `ref.*` wire authoring;
- property scopes and canonical defaults;
- node definitions and `NodeDefinitionRegistry`;
- `ScreenRegistry` and explicit screen registration;
- `SduiBuilder`;
- `SduiValidator`;
- `SduiService`;
- serialization/model contracts;
- Partner/Customer/Admin screen composers under `sdui/engine/src/screens/*`.

The retired `sdui/ui-sdk` package must not return.

The canonical hierarchy is:

```text
Template -> Component -> Element
Template -> Component -> Section -> Element
Template -> Component -> Section -> Group -> Element
```

Template and Component are mandatory. Element is terminal. Section and Group are optional according to the selected legal branch.

## 3. Two meanings of registry

### Engine registries — permanent

These are part of the permanent engine architecture:

```text
sdui/engine/src/registry/NodeDefinitionRegistry.ts
sdui/engine/src/registry/ScreenRegistry.ts
```

They are required for one-time canonical definition registration and screen-composer lookup. They do not persist draft/publication history.

### `sdui/registry` workspace — persisted lifecycle only

The standalone `@carbroz/sdui-registry` workspace is **KEEP** for the current architecture because concrete runtime/admin callers and persisted records still require its lifecycle/version capabilities:

```text
draft
publish
archive
history
compare
rollback
current-version resolution
version transactions
persisted screen versions
```

It consumes `@carbroz/sdui-engine` contracts and validation. It is **not** allowed to become a second SDUI vocabulary, builder, property framework, definition registry, validator or screen-composition authority.

Compatibility catalogue persistence may remain only while concrete callers or persisted data require it. It must be removed/converged only after caller and persisted-data analysis proves that deletion is safe.

## 4. Generic action contract

The canonical action/reference implementation now belongs to the engine:

```text
sdui/engine/src/core/Action.ts
sdui/engine/tests/Action.spec.ts
```

Frozen generic action vocabulary:

```text
request
navigate
present
dismiss
state
external_uri
sequence
```

Frozen references:

```text
$binding
$context
$response
$literal
```

Request-dependent navigation uses `request` with `responseMode = destination`; it must not be modeled as `sequence(request, navigate)`.

## 5. Partner Login / OTP behavior authority

`PARTNER-AUTH-SDUI-CONTRACT.md` freezes the external Partner auth flow:

```text
Bootstrap -> Login -> Send OTP -> OTP -> Verify OTP -> Dashboard
```

The concrete Login and OTP screen composers are owned only by:

```text
sdui/engine/src/screens/partner/PartnerLoginScreen.ts
sdui/engine/src/screens/partner/PartnerOtpScreen.ts
```

API Partner routes/controllers are transport adapters only. They may request a registered engine screen, but they must not maintain wrapper builders or duplicate screen composition under `apps/api` or `domains/*`.

Business authentication and OTP policy remain in Identity/application ports and their infrastructure adapters. SDUI does not own authentication policy.

## 6. OTP/security authority

`../docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md` remains authoritative for OTP security/persistence where not superseded by a later security Constitution rule.

Production OTP persistence must not silently fall back to Prisma or process-memory state. Redis-backed challenge semantics, one-time consume behavior, attempt limits, expiry, security ordering and safe error behavior must remain tested.

## 7. Configuration boundary

Configuration owns startup routing/configuration decisions, not screen structure.

For Partner bootstrap:

```text
guest -> Partner Login destination
authenticated -> Partner Dashboard destination
```

The destination identifies the next resource; the actual Login/OTP screen definition remains engine-owned.

## 8. Historical documents

Phase/audit/reconciliation documents under `sdui/` are historical evidence unless explicitly listed above as a current authority. Keep them truthful to the repository state they audited; do not use old package paths or builder APIs from those files as implementation instructions.

Examples include historical phase closeouts, source reconciliations and forensic audits.

## 9. Change rule

For an SDUI change:

```text
latest governing contract
-> architecture/ownership check
-> implementation at the existing owner
-> focused positive + negative tests
-> wire/behavior parity proof where applicable
-> canonical architecture gates
-> exact-SHA verification
```

Do not add compatibility wrappers, aliases, secondary registries, secondary validators, duplicate screen composers or duplicate property systems to make a migration easier.

## 10. Current focused freeze

The current freeze scope is deliberately limited to:

```text
Configuration
Partner Login
Partner OTP
SDUI architecture/design
```

Within this scope the target is:

- one `sdui/engine` language/composition/validation authority;
- no `ui-sdk`;
- engine-owned Partner Login and OTP screen composers;
- API transport-only screen delivery;
- Identity-owned Login/OTP business behavior;
- Redis-backed production OTP challenge persistence;
- Configuration-owned bootstrap/startup decision data;
- standalone `sdui/registry` restricted to persisted lifecycle/version behavior and retained only because current Dashboard/Admin lifecycle consumers require it;
- focused tests and documentation aligned with the exact implementation;
- no unrelated backend feature expansion during this freeze.
