# CarBroz SDUI Documentation Authority Map

> **Status:** ACTIVE — read this before changing SDUI code.

This file identifies the current SDUI implementation authorities and separates them from historical migration evidence.

## 1. Current read order

For implementation, use this order:

```text
1. sdui/README.md                                  // current authority map + latest frozen amendments
2. SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md
3. PARTNER-AUTH-SDUI-CONTRACT.md                 // Login / OTP behavior
4. docs/PARTNER-AUTH-SDUI-MVI-UDF-HANDOFF.md
5. docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md
6. docs/MASTER-BACKEND-CONSTITUTION.md
7. executable architecture / freeze gates
```

If a historical document describes a different builder, package, hierarchy, screen owner, file path, default, or theme rule, it does not override this architecture.

The Master Backend Constitution and the frozen SDUI implementation plan are reconciled to the same physical topology and ownership model: `sdui/engine` is canonical and the standalone `sdui/registry` is retained only for concrete persisted lifecycle/version responsibilities.

**Latest frozen amendment:** the old illustrative `theme: partnerAuthTheme` example in `SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md` is superseded by Section 12 of this README. There is no auth-specific theme abstraction in the current architecture. New screen composition uses one canonical default screen theme and per-screen overrides only where data genuinely differs.

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

`SDUI-FINAL-FORENSIC-AUDIT.md` and `PHASE-A-SOURCE-RECONCILIATION.md` are explicitly labeled historical/superseded because they retain migration-era `ui-sdk` evidence that must not be interpreted as current architecture.

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

## 11. Frozen property/default model

Every property supported by a reusable SDUI node belongs conceptually to exactly one of these five categories:

| Classification | Meaning | Automatically returned? | Instance override? | Typical examples |
|---|---|---|---|---|
| **Base / default** | Fundamental layout/rendering behavior of that node type | **Yes only when the owning `NodeDefinition.defaults` declares a canonical value** | Yes | `padding`, `spacing`, `orientation`, `width`, `height`, alignment/arrangement |
| **Style** | Visual customization | Only when explicitly set or deliberately defaulted by the owning definition | Yes | `background`, `border`, `shape`, `elevation`, `alpha`, typography |
| **Content / instance** | Screen-specific display data | No, unless the owning definition has an explicit safe default | Yes | `text`, `imageUrl`, `placeholder`, `label`, `icon` |
| **Behavior** | Runtime interaction/configuration | No, unless the owning definition has an explicit safe default | Yes | `binding`, `validation`, `actions`, `enabled`, `visibility`, `keyboardType` |
| **Metadata / semantic** | Accessibility/meaning/runtime hints | Only when explicitly set or deliberately defaulted by the owning definition | Yes where legal | `semanticRole`, `contentDescription`, `testTag` |

The category name does **not** itself create a default. The reusable node definition is the only authority for whether a property has an automatic value.

The frozen resolution pipeline is:

```text
NodeDefinition.defaults
        +
instance values authored through base/style/content/behavior/metadata scopes
        ↓
deterministic deep merge
        ↓
strict node property parser/validation
        ↓
canonical serialized properties
```

Frozen semantics:

1. Every value present in `NodeDefinition.defaults` is emitted even when the screen composer does not mention it.
2. A screen may override any legal default for that node instance.
3. A legal non-default property is omitted unless explicitly supplied.
4. One screen/node override must never mutate the definition defaults or another screen/node instance.
5. Nested plain objects merge recursively and deterministically.
6. Arrays replace as complete values; they are not element-by-element merged.
7. `undefined` means no override and leaves the default intact.
8. The fully resolved property object is strictly validated after resolution.
9. Unknown/illegal properties are rejected rather than silently dropped.
10. Golden tests must prove default emission, legal override, isolation/non-mutation, omission of non-defaults, and deterministic nested merging.

### 11.1 Current implemented defaults are the truth

Do not infer defaults from examples, UI designs, property-category names or old documents. Read the current node definition.

At the time of this freeze, the engine currently implements these canonical defaults:

```text
stack_template / default_template / stack_component / stack_section / stack_group
  orientation = vertical
  verticalArrangement = spacedBy(0)
  padding = { start: 0, top: 0, end: 0, bottom: 0 }

form_template
  all stack defaults above
  semanticRole = form

text
  semanticRole = text

image
  semanticRole = image
  contentScale = fit

input
  semanticRole = input
  keyboardType = text

button
  semanticRole = action
```

Properties such as width, height, fill behavior, alignment, background, border, shape and typography are **supported capabilities but are not automatically defaulted merely because they appear in conceptual examples**. If a universal default is required later, it must first be deliberately added to the owning `NodeDefinition.defaults`, documented here/current contract, covered by golden tests, and then consumed by screens without repeating the default.

## 12. Frozen screen-theme default/override rule

`theme` is a **screen-level protocol object** and uses the same architectural principle as reusable node defaults: common data belongs to one canonical default; screen composers state only genuine differences.

There is no Login theme, OTP theme, Partner Auth theme, Customer theme builder, or per-screen theme wrapper in the frozen architecture.

The canonical default theme is owned by the SDUI engine as `DEFAULT_SDUI_THEME` and is resolved by `SduiBuilder.screen()` for every newly composed screen.

Current canonical default:

```text
theme = light
statusBar = transparent
properties.gradient.type = linear
properties.gradient.angle = 135
properties.gradient.colors = CarBroz default gradient colors
```

Normal screen authoring therefore does **not** mention theme:

```ts
sdui.screen({
  id: 'partner_login',
  targetApp: 'PARTNER',
}, screen => {
  // compose template/components/elements only
});
```

The builder emits the complete canonical theme automatically.

If one screen genuinely differs, it supplies only the changed data:

```ts
sdui.screen({
  id: 'special_screen',
  targetApp: 'PARTNER',
  theme: {
    statusBar: 'default',
    properties: {
      gradient: { angle: 90 },
    },
  },
}, screen => {
  // compose screen
});
```

Frozen theme-resolution pipeline:

```text
DEFAULT_SDUI_THEME
        +
optional screen theme overrides
        ↓
deterministic deep merge
        ↓
strict themeSchema validation
        ↓
complete canonical screen.theme JSON
```

Frozen semantics:

1. Every newly composed screen receives the canonical default theme even when the composer declares no theme.
2. Login, OTP, Dashboard and future screens must not repeat canonical theme values.
3. A screen may override only the data that genuinely differs.
4. Nested theme objects merge recursively and deterministically.
5. Arrays such as gradient colors replace as complete values if explicitly overridden.
6. One screen override must not mutate `DEFAULT_SDUI_THEME` or another screen.
7. The resolved theme is validated by `themeSchema` before serialization.
8. Do not create `partnerAuthTheme`, `ThemeBuilder`, per-feature theme wrappers or another theme framework merely for naming/syntax.
9. Backward-compatible persisted documents may still be readable without `theme`, but all new builder-produced screens emit the resolved canonical theme.
10. Any future change to the universal default must change the single engine default, documentation and golden tests together; screen composers remain unchanged unless they intentionally override it.

## 13. Frozen-decision documentation governance

A decision that is discussed and declared **frozen** is not considered implementation authority while it exists only in chat, review comments or memory. It must be written into the current governing repository documentation before or in the same change that implements it.

From this freeze forward:

1. **Document first or together:** every new frozen architecture/contract/ownership/default/wire decision must update the highest relevant current authority before or with implementation.
2. **No contradictory active documents:** when a new frozen decision supersedes old active guidance, the old active guidance must be updated or explicitly superseded in the same convergence change.
3. **Historical evidence is explicit:** an obsolete phase/audit document may remain only when it is useful evidence and is clearly labeled `HISTORICAL`, `SUPERSEDED`, or equivalent near the top.
4. **Delete noise when evidence has no value:** obsolete documents that add no useful audit/history value should be removed instead of retained indefinitely.
5. **Current authority always wins:** the current read order in this README must identify the latest implementation direction and any explicit amendments to older examples.
6. **No implementation from stale examples:** examples that differ from current definitions/contracts are illustrative only; current executable definitions and current frozen contract text govern.
7. **Update the authority map:** if ownership/read order changes, this README must be updated in the same change.
8. **Tests freeze behavior:** important frozen semantics must have executable regression/golden tests wherever practical; documentation alone is not sufficient for behavior that can regress.
9. **Exact-SHA verification:** a freeze is not complete until the final documentation + implementation candidate is validated on the same exact commit SHA.
10. **Never restore superseded architecture for convenience:** do not recreate wrappers, duplicate registries, duplicate validators, secondary builders, old package paths or compatibility ownership merely because an old document mentions them.

This governance rule exists specifically to prevent future sessions from following migration history instead of the latest frozen architecture.
