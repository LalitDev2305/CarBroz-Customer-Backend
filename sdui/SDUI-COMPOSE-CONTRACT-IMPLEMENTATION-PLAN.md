# CarBroz SDUI Dynamic Composition Architecture & Implementation Guide

> **Status:** ARCHITECTURE DECISION FROZEN FOR IMPLEMENTATION. This freezes the target architecture only; production SDUI composition remains open until source convergence and verification are complete.

## 1. Purpose

This document is the canonical implementation contract for CarBroz backend SDUI composition. It replaces the earlier assumption that product screens may manually construct the final nested SDUI JSON and then call `screenSchema.parse(...)`.

The final architecture preserves the existing hierarchy and the valid responsibilities already present in `ui-sdk` and the runtime registry, but makes typed object-graph Builders the canonical authoring path for screen-specific composition.

No migrated production screen should manually assemble the final SDUI JSON tree.

## 2. Goals

The backend must describe screens through one strongly typed reusable SDUI language without forcing each product screen to know or reproduce the serialized hierarchy.

The architecture must provide:

- one canonical hierarchy;
- generic reusable definitions;
- shared atomic property schemas;
- definition-specific property contracts;
- definition-specific typed builders;
- hierarchy-safe parent/child composition;
- screen-specific builders in the owning domain;
- canonical validation before publication;
- runtime draft/publish/version/retrieve through the registry;
- no duplicate SDUI engine;
- no screen-specific primitive definitions;
- no production reliance on arbitrary `Record<string, unknown>` properties for known definitions;
- no giant manually nested JSON as the production authoring model.

## 3. Canonical Hierarchy

The hierarchy remains unchanged:

```text
Screen
  → Template
      → Component
          → Element

Screen
  → Template
      → Component
          → Section
              → Element

Screen
  → Template
      → Component
          → Section
              → Group
                  → Element
```

Mandatory invariants:

1. Screen has exactly one Template.
2. Template has one or more Components.
3. Component contains Elements OR Sections, never both.
4. Section contains Elements OR Groups, never both.
5. Group contains Elements only.
6. Element is terminal.
7. Component cannot directly contain Group.
8. Template cannot directly contain Section, Group or Element.
9. Group cannot contain Group or Section.
10. Element cannot contain children.

The Builder API must make valid hierarchy natural and invalid hierarchy impossible or immediately rejected.

## 4. Core Semantic Contract

Every runtime node follows:

```text
id          = instance identity
type        = reusable behavior definition
properties  = configuration values for this instance
children    = hierarchy owned by this instance where permitted
```

Example:

```text
id   = login_content
type = stack_component
```

`login_content` is screen-specific identity. `stack_component` is reusable behavior.

Do not create `login_stack_component`, `otp_stack_component`, `dashboard_stack_component`, etc. merely because instance values differ.

## 5. Reuse Principle

The backend reuses the SDUI language and behavior. Each screen owns its own instance data.

Login, OTP and Dashboard may all use `stack_component` with different values:

```text
Login      → vertical, spacing 16
OTP        → vertical, spacing 20
Dashboard  → horizontal, spacing 12
```

There is one reusable `stack_component` definition and one reusable `StackComponentProperties` contract. Each screen-specific builder supplies its instance values.

## 6. Final Ownership Model

### 6.1 UI SDK owns the reusable SDUI language

`ui-sdk` owns:

- canonical contracts and structural schemas;
- shared atomic property schemas;
- reusable definitions and definition registries;
- definition-specific property contracts;
- definition-specific typed node builders;
- factories where they remain legitimate existing owners;
- base screen/hierarchy builder primitives;
- hierarchy/property/canonical validation;
- serializer;
- versioning;
- public exports.

`ui-sdk` must not know about Login, OTP, Dashboard, Booking or other business screens.

### 6.2 Owning domain owns screen-specific composition

The owning domain/surface owns:

- screen ID and node instance IDs;
- selected reusable node types;
- screen-specific property values;
- content/text;
- actions and bindings;
- validation values;
- analytics/accessibility values where applicable;
- exact screen composition.

This is expressed through screen-specific composition builders such as `PartnerLoginScreenBuilder`, `PartnerOtpScreenBuilder` and `PartnerDashboardScreenBuilder` in their correct owners.

These are orchestration classes only. They are not a second SDUI framework and must consume the reusable `ui-sdk` builders/contracts.

### 6.3 Runtime Registry owns document lifecycle

The runtime registry owns:

```text
CREATE draft
UPDATE draft
VALIDATE draft
PUBLISH version
ARCHIVE version
RETRIEVE published version
```

It does not dynamically redefine the meaning of core SDK types.

## 7. Property Architecture

### 7.1 Shared atomic property schemas

Reusable atomic concepts remain centralized:

```text
sdui/ui-sdk/src/properties/
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

These files define reusable atomic vocabulary only: Orientation, Arrangement, Alignment, Spacing, Size, Color, Background, Border, Shape, Accessory, etc.

### 7.2 No global final `stack-properties.schema.ts`

A global `stack-properties.schema.ts` must not own the final property contract for Template, Component, Section and Group.

Although those definitions share atomic concepts, their valid property sets may evolve independently. The final composed property contract therefore lives beside the definition that owns it.

Target organization:

```text
sdui/ui-sdk/src/definitions/
├── templates/
│   └── stack/
│       ├── stack-template.definition.ts
│       ├── stack-template.properties.ts
│       ├── stack-template.builder.ts
│       └── index.ts
├── components/
│   └── stack/
│       ├── stack-component.definition.ts
│       ├── stack-component.properties.ts
│       ├── stack-component.builder.ts
│       └── index.ts
├── sections/
│   └── stack/
│       ├── stack-section.definition.ts
│       ├── stack-section.properties.ts
│       ├── stack-section.builder.ts
│       └── index.ts
├── groups/
│   └── stack/
│       ├── stack-group.definition.ts
│       ├── stack-group.properties.ts
│       ├── stack-group.builder.ts
│       └── index.ts
└── elements/
    ├── text/
    │   ├── text.definition.ts
    │   ├── text.properties.ts
    │   ├── text.builder.ts
    │   └── index.ts
    ├── image/
    ├── icon/
    ├── input/
    ├── button/
    ├── divider/
    └── spacer/
```

Exact migration paths must follow `KEEP → EXTEND → MODIFY → CREATE`; existing legitimate owners are extended rather than duplicated.

### 7.3 Property ownership rule

```text
Atomic property schema
    = reusable primitive vocabulary

Definition-specific properties
    = exact properties accepted by that definition

Screen-specific builder
    = actual values used by a particular screen instance
```

For example `orientation.schema.ts` can be reused by `StackTemplateProperties`, `StackComponentProperties`, `StackSectionProperties` and `StackGroupProperties`, while each definition independently decides which atomic properties it accepts.

## 8. Builder Architecture — Object Graph, Not Raw JSON

The Builder layer is the canonical screen-authoring mechanism.

The builder model is an object graph. It is not one global stateful fluent chain and not a raw JSON wrapper.

Each parent builder object owns and creates its children:

```text
ScreenBuilder
    └── TemplateBuilder
        ├── ComponentBuilder
        │   ├── ElementBuilder(s)
        │   └── OR SectionBuilder(s)
        │       ├── ElementBuilder(s)
        │       └── OR GroupBuilder(s)
        │           └── ElementBuilder(s)
        └── ComponentBuilder
            └── ...
```

### 8.1 Parent object is the relationship

Normal composition must not depend on a global `currentComponent`, hidden mutable parent state, parent-ID lookup, or manually nested arrays.

Instead:

```text
screen.addTemplate(...)
template.addComponent(...)
component.addSection(...)
component.addElement(...)
section.addGroup(...)
section.addElement(...)
group.addElement(...)
```

The actual parent builder object establishes ownership. This is a frozen design rule.

## 9. Typed Node Builders

Reusable definitions expose typed builders appropriate to their behavior, for example:

```text
StackTemplateBuilder
StackComponentBuilder
StackSectionBuilder
StackGroupBuilder
TextBuilder
ImageBuilder
IconBuilder
InputBuilder
ButtonBuilder
DividerBuilder
SpacerBuilder
```

Builders expose semantic methods instead of forcing screen code to know serialized property shape:

```ts
component
  .vertical()
  .spacing(16)
  .alignCenter()
  .fillMaxWidth();
```

rather than manually constructing a `properties` object.

The builder translates semantic calls into the canonical definition-specific property contract. If serialized representation changes later, the generic builder can change while screen-specific composition remains stable.

## 10. Hierarchy-Safe Builder API

Valid public operations include:

```text
screen.addTemplate()
template.addComponent()
component.addElement()
component.addSection()
section.addElement()
section.addGroup()
group.addElement()
```

Invalid relationships must not be normal API operations:

```text
screen.addComponent()       INVALID
template.addSection()       INVALID
component.addGroup()        INVALID
group.addSection()          INVALID
group.addGroup()            INVALID
element.addElement()        INVALID
```

XOR rules are mandatory:

```text
Component → Elements OR Sections
Section   → Elements OR Groups
```

Once a Component selects direct Elements, adding Sections must fail. Once it selects Sections, adding direct Elements must fail. The same applies to Section with Elements versus Groups.

Compile-time modeling is preferred where practical; runtime enforcement remains mandatory defense in depth.

## 11. Screen-Specific Builder Pattern

A screen-specific builder lives with the domain/surface that owns the screen. It should be compact and read like the high-level screen structure.

Example conceptual organization:

```text
domains/identity/
└── presentation/
    └── sdui/
        └── builders/
            ├── partner-login-screen.builder.ts
            └── partner-otp-screen.builder.ts
```

Other screens belong to their correct owner rather than being forced into Identity.

Recommended style:

```ts
build(): SduiScreen {
  const screen = this.createScreen();
  const template = this.createTemplate(screen);

  this.addBrandComponent(template);
  this.addLoginComponent(template);
  this.addFooterComponent(template);

  return screen.build();
}
```

Recommended granularity:

```text
build()
    = screen-level flow

private component methods
    = major screen blocks

private section methods
    = complex subsections only

simple elements
    = created directly inside their owning parent method
```

Do not split every element into a class/method when it adds no clarity.

## 12. Canonical Object-Graph Example

The following is illustrative; exact API names must be reconciled with existing source before implementation.

```ts
const screen = new ScreenBuilder({
  screenId: 'partner_login',
  targetApp: 'PARTNER',
  schemaVersion: '3.0.0',
});

const template = screen.addStackTemplate('tpl_partner_login');

template.vertical().fillMaxSize();

const brand = template.addStackComponent('brand_component');
brand.vertical().alignCenter().spacing(8);
brand.addImage('brand_logo').source('carbroz_partner_logo');
brand.addText('brand_title').value('CarBroz Partner');

const form = template.addStackComponent('login_component');
form.vertical().fillMaxWidth().spacing(16);

const mobileSection = form.addStackSection('mobile_section');
const mobileGroup = mobileSection.addStackGroup('mobile_group');
mobileGroup.horizontal().spacing(8);
mobileGroup.addText('country_code').value('+91');
mobileGroup
  .addInput('mobile_number')
  .binding('mobileNumber')
  .phone()
  .required()
  .maxLength(10);

const actionSection = form.addStackSection('action_section');
actionSection
  .addButton('continue_button')
  .text('Continue')
  .action('send_otp');

const result = screen.build();
```

The screen code never manually creates final `components: []`, `sections: []`, `groups: []` or `elements: []` arrays. The object graph owns those relationships.

## 13. Multiple Components and Exact Child Ownership

A Template may contain many Components:

```text
Template
├── Component 1
├── Component 2
└── Component 3
```

Each returned Component builder is a distinct object reference:

```ts
const component1 = template.addStackComponent('brand');
const component2 = template.addStackComponent('form');
const component3 = template.addStackComponent('footer');
```

Children are added to the exact intended parent:

```ts
component1.addText(...);

const section = component2.addStackSection(...);
section.addButton(...);

component3.addText(...);
```

There is no ambiguity about which Component owns a Section, Group or Element. Parent-object ownership is mandatory.

## 14. Base Builder vs Screen Builder

### UI SDK reusable/base builders — HOW SDUI is built

They own:

- node creation;
- typed properties;
- hierarchy ownership;
- XOR enforcement;
- definition lookup;
- canonical node creation;
- recursive final construction;
- integration with validation.

### Domain screen-specific builder — WHAT the screen contains

It owns:

- screen identity;
- instance IDs;
- selected reusable types;
- property values;
- content;
- actions;
- bindings;
- screen-specific validation values;
- exact composition.

This separation is mandatory.

## 15. Definition and Builder Flow

The intended internal flow is:

```text
Domain Screen-Specific Builder
        ↓
Reusable Typed Node Builders
        ↓
Definition-Specific Properties
        ↓
Reusable Definitions / Definition Registries
        ↓
Existing Factories where legitimately required
        ↓
Canonical Node Contracts
        ↓
Canonical Hierarchy
        ↓
Layered Validator
        ↓
SduiScreen
```

Builders must not bypass reusable definitions/property contracts by creating arbitrary unvalidated property bags.

## 16. Validation Model

Validation remains layered:

1. **JSON / structural** — canonical shape and required fields.
2. **Hierarchy** — legal parent/child relationships and XOR branches.
3. **Definition** — every `type` resolves to a registered reusable definition.
4. **Property** — properties satisfy the exact definition-specific schema.
5. **Invariant** — cross-field and semantic invariants.
6. **Version / target** — schema version, target application and compatibility.
7. **Publication** — all publication requirements before activation.

Builder safety does not replace final validation. The validator remains the authoritative defense-in-depth boundary.

## 17. Registry Lifecycle

After a screen-specific builder produces a canonical screen:

```text
Domain Screen Builder
        ↓
Canonical SduiScreen
        ↓
Validator
        ↓
Registry Draft
        ↓
Publish
        ↓
Versioned Runtime Document
        ↓
Retrieve Published Version
        ↓
Canonical Parse / Validate
        ↓
Serializer
        ↓
API Response
```

The runtime registry manages documents; it is not a second UI-definition registry.

## 18. Explicitly Rejected Anti-Patterns

### Giant raw JSON screen constructors

Product code must not manually reproduce the final nested canonical tree and merely call `screenSchema.parse(...)`.

### Screen-specific primitive definitions

Do not create:

```text
login_stack_component
otp_stack_component
dashboard_stack_component
login_text
otp_button
```

Use generic definitions with screen-specific values.

### Screen-specific property classes duplicating SDK contracts

Do not create `LoginStackComponentProperties`, `OtpStackComponentProperties`, etc. There is one reusable `StackComponentProperties`; screen builders provide different values.

### Hidden current-parent state

Do not make `currentComponent`, `currentSection` or `currentGroup` the primary composition mechanism. Use explicit parent object references.

### Parent-ID based normal composition

Do not make `addElement({ parentId: '...' })` the normal authoring path. The parent object owns the child.

### One global final Stack properties contract

Do not centralize final Stack behavior into `properties/layout/stack-properties.schema.ts`. Final Template/Component/Section/Group property contracts live beside their definitions.

## 19. Current Known Gap

The current source already contains valuable pieces including canonical hierarchy schemas, definition registries, node factories, hierarchy builders, screen builder, serializer/versioning and runtime registry infrastructure.

However, current production Partner screens manually construct large nested JSON documents and call structural parsing directly. The common property contract is also too open for the target architecture (`Record<string, unknown>` behavior), and current validation is shallower than the layered model defined here.

Implementation must therefore converge existing source toward this contract rather than create a parallel framework.

## 20. Migration Strategy

All implementation follows:

```text
KEEP → EXTEND → MODIFY → CREATE
```

Before adding a new artifact:

1. inspect the current owner;
2. KEEP it if it already satisfies the responsibility;
3. EXTEND it if incomplete;
4. MODIFY it if the abstraction is correct but behavior is wrong;
5. CREATE only when no legitimate owner exists.

### Phase A — Source reconciliation

Audit contracts, properties, definitions, registries, factories, builders, validator, serializer, versioning, runtime registry and Login/OTP/Dashboard composition. Produce exact KEEP / EXTEND / MODIFY / CREATE decisions.

### Phase B — Property contracts

Introduce/complete shared atomic property schemas; colocate definition-specific property contracts; remove production reliance on arbitrary property bags for known definitions while preserving required compatibility.

### Phase C — Typed reusable node builders

Make Stack Template/Component/Section/Group builders property-aware; add typed Element builders; expose only legal child APIs; enforce Component and Section XOR branches.

### Phase D — Base object-graph builder

Screen owns Template; Template owns Components; Component owns Elements OR Sections; Section owns Elements OR Groups; Group owns Elements. Final `build()` recursively produces canonical nodes and invokes validation.

### Phase E — Login golden reference

Migrate Partner Login first. It becomes the golden reference for domain screen-builder style, parent-object ownership, typed properties, validation, registry publication/retrieval and API compatibility.

Do not copy the migration to OTP/Dashboard until Login architecture is proven.

### Phase F — OTP migration

Migrate Partner OTP using the proven Login pattern without duplicate abstractions.

### Phase G — Dashboard migration

Migrate Partner Dashboard using the same canonical SDK builders and its own screen-specific composition builder.

### Phase H — Retire obsolete raw composition

After migrated screens are proven, remove obsolete raw construction paths and compatibility-only artifacts that have no remaining legitimate owner.

### Phase I — Full verification and refreeze

Run unit, integration, architecture and canonical repository gates; update documentation; only then refreeze SDUI composition implementation.

## 21. Testing Requirements

Tests must prove behavior rather than only snapshot giant JSON literals. Required coverage includes:

- atomic property schemas;
- definition-specific property validation;
- semantic builder-method mapping;
- Template → Component ownership;
- Component direct-element branch;
- Component section branch;
- Component elements/sections XOR rejection;
- Section direct-element branch;
- Section group branch;
- Section elements/groups XOR rejection;
- Group element ownership;
- invalid hierarchy rejection;
- unknown definition rejection;
- canonical screen build validation;
- screen identity/destination contracts;
- actions and bindings;
- registry draft/publish/retrieve;
- serialized API compatibility;
- Login/OTP/Dashboard end-to-end behavior.

Tests and architecture gates must never be weakened to make migration pass.

## 22. Naming Rules

Generic reusable names belong in `ui-sdk`:

```text
stack_template
stack_component
stack_section
stack_group
text
image
icon
input
button
divider
spacer
```

Screen-specific names belong only to runtime instances/composition builders:

```text
PartnerLoginScreenBuilder
partner_login
login_component
mobile_section
mobile_group
mobile_number
continue_button
```

Do not encode product screen names into reusable primitives unless a genuinely new reusable behavior exists.

## 23. Frozen Responsibility Matrix

| Concern | Owner |
|---|---|
| Canonical hierarchy | `ui-sdk` contracts |
| Atomic property vocabulary | `ui-sdk/properties` |
| Definition-specific properties | definition package |
| Reusable node behavior | definition package |
| Reusable typed node builder | definition package / canonical builder owner |
| Hierarchy object graph | `ui-sdk` base builders |
| Screen-specific composition | owning domain screen builder |
| Screen-specific property values | owning domain screen builder |
| Screen-specific actions/bindings/content | owning domain screen builder |
| Final canonical validation | `ui-sdk` validator |
| Serialization | `ui-sdk` serializer |
| Schema compatibility/versioning | `ui-sdk` versioning |
| Draft/publish/archive/retrieve | runtime SDUI registry |
| HTTP transport | API/surface layer |
| Rendering | frontend SDUI renderer |

## 24. Frozen Architecture Summary

```text
Shared Atomic Properties
        ↓
Definition-Specific Properties
        ↓
Reusable SDUI Definitions
        ↓
Typed Definition-Specific Node Builders
        ↓
Base Hierarchy/Object-Graph Builders
        ↓
Domain Screen-Specific Builder
        ↓
Canonical SduiScreen
        ↓
Layered Validator
        ↓
Runtime Registry
        ↓
Serializer
        ↓
API
        ↓
Frontend Renderer
```

Frozen implementation rules:

1. Final SDUI hierarchy does not change.
2. UI SDK remains the single reusable SDUI language/engine.
3. Shared atomic properties stay centralized.
4. Definition-specific property contracts live beside their definitions.
5. There is no global final `stack-properties` contract.
6. Screen-specific builders live with the owning domain.
7. Parent builder objects own and create their children.
8. Object references establish hierarchy; hidden current-parent state does not.
9. Typed builder methods hide final JSON property representation from screen code.
10. Screen builders describe screen intent/composition, not raw JSON structure.
11. Definitions remain generic; instance values remain screen-specific.
12. Builder safety is backed by final canonical validation.
13. Registry remains responsible for runtime document lifecycle.
14. No duplicate SDUI framework may be introduced.
15. Login is the first golden-reference migration before OTP and Dashboard.

## 25. Freeze Gate

This document freezes the **target architecture**, not the current implementation state.

The current SDUI composition implementation remains open until source has converged to this contract and verification is complete.

The SDUI composition campaign may be declared **COMPLETE + FROZEN** only after:

1. implementation conforms to this document;
2. Login, OTP and Dashboard use the canonical builder path;
3. obsolete raw composition paths are retired or explicitly justified;
4. documentation matches final source;
5. full canonical Backend CI is green on the documentation-complete `development` HEAD;
6. independent Architecture Closeout is green on the exact same SHA;
7. a second-pass forensic architecture audit finds no material drift or duplicate ownership.

Until those conditions are satisfied, this document is the frozen implementation target and SDUI composition source remains under migration.
