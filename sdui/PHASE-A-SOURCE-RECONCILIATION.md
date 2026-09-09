# SDUI Phase A — Source Reconciliation

> **Status:** COMPLETE — source audit only. No production SDUI implementation changes are included in this phase.
>
> **Authority:** `SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`
>
> **Decision rule:** `KEEP → EXTEND → MODIFY → CREATE`.

## 1. Purpose

Phase A reconciles the frozen SDUI composition architecture against the current `development` source before any implementation begins.

The objective is to identify which existing artifacts are already legitimate owners, which must be extended, which must be changed because they conflict with the frozen architecture, and which genuinely missing artifacts must be created.

This phase does **not** migrate Login, OTP or Dashboard and does **not** change runtime behavior.

---

## 2. Executive Result

The repository already contains the correct major SDUI building blocks:

- canonical structural contracts;
- reusable definition registries;
- production definition bootstrap;
- node factories;
- hierarchy builders;
- screen builder;
- serializer;
- schema versioning;
- runtime registry draft/publish/version/retrieve infrastructure.

The problem is not absence of architecture. The problem is that the architecture is currently incomplete and is bypassed by production Partner screen composition.

The principal source gaps are:

1. known SDUI definitions still accept open `Record<string, unknown>` property bags;
2. there is no dedicated typed `ui-sdk/src/properties/` vocabulary;
3. reusable definitions are monolithic registration functions rather than definition-specific packages with typed property contracts and builders;
4. current generic hierarchy builders accept already-built child nodes instead of owning child-builder creation through parent object references;
5. the current validator is only structural `screenSchema.parse/safeParse`;
6. Login, OTP and Dashboard manually construct final nested JSON and call `screenSchema.parse(...)` directly;
7. the runtime Registry currently persists and exposes reusable Component/Section/Group/Element catalogue operations, which overlaps with the frozen rule that reusable definition meaning belongs to `ui-sdk`;
8. `row_group` and `column_group` encode orientation as separate behavior types even though the frozen model requires reusable `stack_group` plus instance properties where behavior is otherwise identical.

Therefore the correct implementation strategy is convergence of the existing system, not creation of a parallel SDUI engine.

---

## 3. Canonical Ownership Reconfirmed

### `ui-sdk`

Owns reusable language and composition mechanics:

- structural schemas;
- actions/bindings/interactions;
- atomic property vocabulary;
- reusable definitions;
- definition registries;
- definition-specific property contracts;
- typed reusable node builders;
- base object-graph hierarchy builders;
- factories where still useful;
- final layered validation;
- serializer;
- schema compatibility/versioning;
- public exports.

### Owning domain / product surface

Owns screen-specific composition only:

- screen ID;
- instance node IDs;
- selected reusable definitions;
- property values;
- text/content;
- actions;
- bindings;
- validation values;
- analytics/accessibility values;
- exact screen structure.

### Runtime `sdui/registry`

Owns runtime screen-document lifecycle:

```text
CREATE DRAFT
UPDATE DRAFT
VALIDATE DRAFT
PUBLISH VERSION
ARCHIVE VERSION
ROLL BACK VERSION
RETRIEVE PUBLISHED VERSION
HISTORY / VERSION LOOKUP
```

It must not become a second authority for reusable `stack_component`, `text`, `button`, etc. definitions.

---

## 4. Reconciliation Matrix

## 4.1 Structural contracts — KEEP

Current owner:

```text
sdui/ui-sdk/src/contract/
```

Current files include:

- `screen.schema.ts`
- `template.schema.ts`
- `component.schema.ts`
- `section.schema.ts`
- `group.schema.ts`
- `element.schema.ts`
- `action.schema.ts`
- `common.schema.ts`

### Decision: KEEP

The hierarchy contracts already model the frozen hierarchy and the current Component/Section XOR shape.

They remain the canonical serialized SDUI structure.

### Required later change

`common.schema.ts` currently exposes:

```ts
propertiesSchema = z.record(z.string(), z.unknown())
```

The structural contract may retain an open compatibility boundary if necessary, but **known production definitions must stop treating this open bag as their final property contract**.

Typed definition-specific validation will sit above/alongside the structural schema.

Classification for `common.schema.ts`: **MODIFY carefully in Phase B only if required for integration; do not break compatibility prematurely.**

---

## 4.2 Action / binding language — KEEP

Current generic interaction language remains owned by `ui-sdk`.

### Decision: KEEP

Login/OTP migrations must consume the existing action/binding contracts rather than invent screen-specific action models.

No duplicate request/navigation/action language will be introduced.

---

## 4.3 Atomic properties package — CREATE

Current source has no:

```text
sdui/ui-sdk/src/properties/
```

### Decision: CREATE

Create only the missing atomic reusable vocabulary, initially driven by properties already used by existing production screens.

Frozen initial structure:

```text
properties/
├── layout/
│   ├── orientation.schema.ts
│   ├── arrangement.schema.ts
│   ├── alignment.schema.ts
│   ├── spacing.schema.ts
│   └── size.schema.ts
├── appearance/
│   ├── color.schema.ts
│   ├── background.schema.ts
│   ├── border.schema.ts
│   └── shape.schema.ts
├── accessory/
│   └── accessory.schema.ts
└── index.ts
```

Do not create a global final `stack-properties.schema.ts`.

Atomic schemas are reusable primitives only.

---

## 4.4 Definition registries — KEEP + EXTEND

Current owner:

```text
sdui/ui-sdk/src/registry/
```

The current registries provide separate Template, Component, Section, Group and Element definition registries.

### Decision: KEEP

The abstraction and ownership are correct.

### EXTEND

The registration contract must become compatible with definition-specific typed properties and typed builders.

Current generic `InstanceInput.properties?: Record<string, unknown>` cannot remain the only property contract for known production definitions.

Do not create another definition registry.

---

## 4.5 Production definition bootstrap — KEEP + EXTEND

Current owner:

```text
sdui/ui-sdk/src/definitions/production-definitions.ts
```

### Decision: KEEP

The single production bootstrap and idempotent registration behavior are legitimate.

### EXTEND

As definitions move into definition-specific packages, this file should remain the central product-neutral registration entry point and import/register those concrete definitions.

Do not replace it with screen-specific registration.

---

## 4.6 Template definitions — MODIFY

Current owner:

```text
sdui/ui-sdk/src/definitions/templates/index.ts
```

Current production types:

```text
default_template
form_template
stack_template
```

### Decision: MODIFY

Keep the reusable type names unless later source proof shows one is obsolete, but split the `stack_template` implementation into its own definition package.

Target responsibility:

```text
definitions/templates/stack/
├── stack-template.definition.ts
├── stack-template.properties.ts
├── stack-template.builder.ts
└── index.ts
```

Current behavior merges arbitrary properties into defaults. That is insufficient.

`StackTemplateProperties` must own exactly the valid configurable property vocabulary for `stack_template`.

---

## 4.7 Component definitions — MODIFY

Current owner:

```text
sdui/ui-sdk/src/definitions/components/index.ts
```

Current production types:

```text
content_component
form_component
stack_component
```

### Decision: MODIFY

The existing registry/bootstrap concept stays, but `stack_component` must become a real typed reusable behavior with:

- `StackComponentProperties`;
- `StackComponentBuilder`;
- definition-level property validation;
- Component XOR hierarchy safety.

No `login_component`, `otp_component`, `dashboard_component`, `vertical_component` or `horizontal_component` definitions are allowed merely for different instance values.

---

## 4.8 Section definitions — MODIFY

Current owner:

```text
sdui/ui-sdk/src/definitions/sections/index.ts
```

Current production types:

```text
content_section
stack_section
```

### Decision: MODIFY

`stack_section` becomes a typed reusable definition package with:

- `StackSectionProperties`;
- `StackSectionBuilder`;
- definition-level validation;
- Section Elements/Groups XOR enforcement.

---

## 4.9 Group definitions — MODIFY

Current owner:

```text
sdui/ui-sdk/src/definitions/groups/index.ts
```

Current production types:

```text
row_group
column_group
stack_group
```

### Decision: MODIFY

`stack_group` is the canonical generic stack behavior.

`row_group` and `column_group` currently encode orientation as separate behavior names. Under the frozen reuse rule, orientation alone should be an instance property of `stack_group`.

Migration rule:

- do not immediately delete compatibility types if existing persisted documents still use them;
- stop introducing new production use of orientation-specific aliases;
- migrate current runtime documents/screens to `stack_group` where semantics are equivalent;
- deprecate/remove aliases only after compatibility and persisted-version proof.

This is a Phase B/C/H concern, not an immediate destructive Phase A change.

---

## 4.10 Element definitions — MODIFY

Current owner:

```text
sdui/ui-sdk/src/definitions/elements/index.ts
```

Current production types:

```text
text
image
icon
button
input
divider
spacer
```

### Decision: MODIFY

The type vocabulary is correct and reusable.

Each element must move toward its own definition-specific package and typed properties/builder:

```text
text/
image/
icon/
button/
input/
divider/
spacer/
```

Examples:

- `TextProperties` + `TextBuilder`
- `ImageProperties` + `ImageBuilder`
- `ButtonProperties` + `ButtonBuilder`
- `InputProperties` + `InputBuilder`

Existing generic actions, binding, validation, analytics and accessibility contracts must be reused.

---

## 4.11 Node factories — KEEP + EXTEND

Current owner:

```text
sdui/ui-sdk/src/factory/NodeFactories.ts
```

### Decision: KEEP

The factories correctly resolve through definition registries and parse canonical node structures.

### EXTEND

Factories must work with typed definition inputs and definition-specific property validation.

The existing `raw(...)` helpers must not be the canonical production authoring path. They may remain temporarily for compatibility/tests while migrations occur, then be reviewed in Phase H.

Do not create a second factory system.

---

## 4.12 Generic hierarchy builders — MODIFY + EXTEND

Current owner:

```text
sdui/ui-sdk/src/builder/HierarchyBuilders.ts
```

Current builders correctly enforce:

```text
Component → Elements XOR Sections
Section   → Elements XOR Groups
Group     → Elements
Template  → Components
```

### Decision: KEEP the hierarchy rules, MODIFY the composition API

The current API accepts already-built nodes:

```text
component.addSection(builtSection)
section.addGroup(builtGroup)
template.addComponent(builtComponent)
```

The frozen target requires the parent builder object to create/own child builders so normal screen code does not manually build child arrays or separately construct complete child nodes.

Target direction:

```text
template.addStackComponent(...)
component.addStackSection(...)
component.addText(...)
section.addStackGroup(...)
section.addButton(...)
group.addInput(...)
```

Each call returns the exact child builder object owned by that parent.

No `currentComponent`, parent-ID lookup or global mutable composition cursor.

---

## 4.13 `ScreenBuilder` — MODIFY + EXTEND

Current owner:

```text
sdui/ui-sdk/src/builder/ScreenBuilder.ts
```

### Decision: KEEP the owner, MODIFY the API

Current `ScreenBuilder` receives a fully built `SduiTemplate` through `withTemplate(...)`.

The target object graph requires `ScreenBuilder` to own/create the template builder through a typed API such as:

```text
screen.addStackTemplate(...)
```

The screen must still enforce exactly one Template.

Do not create a second root builder.

---

## 4.14 Validator — EXTEND substantially

Current owner:

```text
sdui/ui-sdk/src/validator/validate-screen.ts
```

Current behavior is only:

```text
screenSchema.parse(...)
screenSchema.safeParse(...)
```

### Decision: KEEP the owner, EXTEND to the frozen layered validator

Required layers:

1. structural;
2. hierarchy;
3. definition resolution;
4. definition-specific property validation;
5. invariants;
6. version/target compatibility;
7. publication validation where relevant.

Do not create another validator package outside `ui-sdk`.

---

## 4.15 Serializer — KEEP + route through final validation

Current owner:

```text
sdui/ui-sdk/src/serializer/ScreenSerializer.ts
```

### Decision: KEEP

Serialization/deserialization ownership is correct.

Once the layered validator exists, final serializer boundaries should use the canonical validation path rather than relying only on structural parsing.

No duplicate serializer is required.

---

## 4.16 Schema versioning — KEEP + EXTEND later

Current owner:

```text
sdui/ui-sdk/src/versioning/SchemaVersion.ts
```

### Decision: KEEP

The owner is correct.

Current support is a single exact version comparison. Compatibility policy can be extended later only as required by the frozen validator/version model.

This is not a reason to create another versioning abstraction.

---

## 4.17 `ui-sdk` public exports — EXTEND

Current owner:

```text
sdui/ui-sdk/src/public/index.ts
```

### Decision: KEEP + EXTEND

As typed properties and reusable builders are added, expose only the canonical public APIs required by product/domain screen builders.

Internal registration details should not become product-screen dependencies unless intentionally part of the public contract.

---

## 4.18 Runtime Registry screen lifecycle — KEEP

Current owner:

```text
sdui/registry/
```

Legitimate lifecycle operations already include:

- create draft;
- update draft;
- publish;
- archive;
- rollback;
- version history;
- version retrieval;
- published-screen retrieval.

### Decision: KEEP

This remains the runtime screen-document lifecycle authority.

The persisted `layoutJson` remains a canonical `SduiScreen` document.

---

## 4.19 Runtime Registry reusable-node catalogue — MODIFY / RETIRE AFTER MIGRATION

Current Registry source also contains:

- `SduiComponentEntity`;
- `SduiSectionEntity`;
- `SduiGroupEntity`;
- `SduiElementEntity`;
- repository methods `create/get/list` for those node catalogues;
- application use cases such as `CreateSduiComponentUseCase`, `CreateSduiSectionUseCase`, `CreateSduiGroupUseCase`, `CreateSduiElementUseCase`.

### Decision: MODIFY

This responsibility overlaps the frozen `ui-sdk` definition authority.

A runtime admin may manage **screen documents**, but it must not dynamically redefine core reusable SDK behavior such as what `stack_component`, `text`, `button`, etc. mean.

Before deletion, determine whether these persisted node records are still used by:

- migrations/seeds;
- admin routes;
- tests;
- published screen retrieval;
- compatibility data.

Then:

1. separate legitimate screen-document lifecycle from reusable definition catalogue behavior;
2. migrate any necessary data/usage;
3. remove or repurpose the duplicate definition-catalogue paths only after proof;
4. preserve registry screen/version entities and lifecycle repository methods.

This work should occur only after the ui-sdk definition model is authoritative.

---

## 4.20 Runtime Registry README — MODIFY

Current README states that Registry owns “SDUI definition registration, lifecycle, lookup, versioning, and publication policy.”

### Decision: MODIFY

This wording conflicts with the frozen responsibility split.

It must eventually state clearly:

```text
ui-sdk       → reusable definition registration/meaning
runtime registry → screen-document draft/version/publication/retrieval
```

Do not change the README alone before source responsibilities converge; update it together with the registry migration.

---

## 4.21 Partner Login raw screen constructor — MODIFY / REPLACE

Current owner:

```text
apps/api/src/surfaces/partner/screens/partner-login.screen.ts
```

Current implementation manually constructs:

```text
Screen
Template
Components
Sections
Groups
Elements
Properties
Actions
Bindings
Validation
```

and then calls:

```ts
screenSchema.parse({...})
```

### Decision: MODIFY / REPLACE through Phase E

Login becomes the first golden-reference migration.

Its screen-specific values remain valid source requirements, but composition ownership moves to an owning-domain `PartnerLoginScreenBuilder` using canonical `ui-sdk` typed builders.

The API surface should retrieve/serve the canonical runtime screen contract rather than own raw SDUI construction mechanics.

Do not copy the current raw style into any new screen.

---

## 4.22 Partner OTP raw screen constructor — MODIFY AFTER LOGIN PROOF

Current owner:

```text
apps/api/src/surfaces/partner/screens/partner-otp.screen.ts
```

### Decision: MODIFY in Phase F

Do not migrate OTP before Login proves the generic property/builder/validation architecture.

No OTP-specific SDUI primitive classes are permitted.

---

## 4.23 Partner Dashboard raw screen constructor — MODIFY AFTER LOGIN/OTP PATTERN

Current owner:

```text
apps/api/src/surfaces/partner/screens/partner-dashboard.screen.ts
```

### Decision: MODIFY in Phase G

Dashboard consumes the same reusable typed SDUI language with its own screen-specific composition.

Do not create dashboard-specific primitive definitions.

---

## 4.24 Partner screen specs — MODIFY, NOT DELETE

Current specs:

```text
partner-login.screen.spec.ts
partner-otp.screen.spec.ts
partner-dashboard.screen.spec.ts
```

### Decision: MODIFY

Preserve functional contract coverage, but move away from tests that merely validate giant manually assembled JSON shape.

Screen tests should prove:

- identity;
- selected definition types;
- important content/actions/bindings;
- destination contracts;
- final canonical validity;
- registry publication/retrieval compatibility;
- API behavior.

Generic property/builder behavior belongs in `ui-sdk` tests rather than being repeatedly retested as raw screen JSON.

---

## 5. Exact KEEP / EXTEND / MODIFY / CREATE Summary

| Artifact / Area | Decision | Reason |
|---|---|---|
| Structural hierarchy schemas | KEEP | Correct canonical serialized hierarchy |
| Action/binding contracts | KEEP | Existing generic interaction language |
| `common.propertiesSchema` open bag | MODIFY carefully | Cannot be final property authority for known definitions |
| `ui-sdk/src/properties/` | CREATE | Missing atomic typed vocabulary |
| Definition registries | KEEP + EXTEND | Correct owner; add typed definition support |
| Production definition bootstrap | KEEP + EXTEND | Correct centralized registration owner |
| Template definitions | MODIFY | Add definition-specific properties/builders |
| Component definitions | MODIFY | Add typed reusable behavior/builders |
| Section definitions | MODIFY | Add typed reusable behavior/builders |
| Group definitions | MODIFY | Canonicalize stack behavior; phase out orientation aliases where equivalent |
| Element definitions | MODIFY | Split into typed element definitions/properties/builders |
| Node factories | KEEP + EXTEND | Correct registry-based creation owner |
| Generic hierarchy builders | MODIFY + EXTEND | Parent objects must own/create child builders |
| `ScreenBuilder` | MODIFY + EXTEND | Screen should own/create Template builder |
| Validator | EXTEND | Must implement layered validation |
| Serializer | KEEP + EXTEND integration | Correct owner; use canonical validator boundary |
| Versioning | KEEP + EXTEND later | Correct owner, currently minimal |
| Public exports | KEEP + EXTEND | Export canonical typed APIs |
| Registry draft/publish/version lifecycle | KEEP | Correct runtime responsibility |
| Registry reusable-node persistence/catalogue | MODIFY, then retire/repurpose after proof | Duplicate authority with ui-sdk definitions |
| Registry README ownership wording | MODIFY with migration | Currently ambiguous/conflicting |
| Partner Login raw screen | MODIFY first | Golden-reference migration |
| Partner OTP raw screen | MODIFY second | Reuse proven Login architecture |
| Partner Dashboard raw screen | MODIFY third | Reuse proven canonical architecture |
| Partner screen specs | MODIFY | Preserve behavior tests; stop raw-construction coupling |

---

## 6. Implementation Order Frozen by Phase A

No implementation phase should skip ahead.

```text
Phase B — atomic + definition-specific property contracts
    ↓
Phase C — typed reusable node builders
    ↓
Phase D — parent-owned object-graph builder integration + layered validation
    ↓
Phase E — Partner Login golden reference
    ↓
Phase F — Partner OTP
    ↓
Phase G — Partner Dashboard
    ↓
Phase H — retire raw constructors and duplicate registry definition catalogue paths
    ↓
Phase I — full verification, docs, exact-SHA CI/architecture proof, refreeze
```

Registry duplicate-definition cleanup must not be destructively performed before ui-sdk typed definitions and runtime screen migration are proven.

---

## 7. Phase B Entry Contract

Phase B may begin only under these rules:

1. start with current production property usage, especially Partner Login, to define required vocabulary;
2. create reusable atomic property schemas only once;
3. compose final properties beside each definition;
4. preserve current serialized JSON field names unless an explicit compatibility migration is approved;
5. do not create a global final Stack property schema;
6. do not create screen-specific property types;
7. keep actions/bindings in their existing generic contracts;
8. maintain backward compatibility while typed validation becomes authoritative;
9. add focused property-contract tests before migrating screens;
10. do not alter Login/OTP/Dashboard composition yet in Phase B.

---

## 8. Phase A Completion Decision

Phase A is complete.

The frozen architecture remains valid after source reconciliation.

No need exists for a new SDUI module or parallel framework. The existing `ui-sdk` and runtime registry remain the owners, but their responsibilities must be converged to the frozen model.

The next allowed implementation step is **Phase B — Property Contracts**.

Production SDUI composition is **not frozen complete** yet.
