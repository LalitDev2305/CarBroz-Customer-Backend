# CarBroz SDUI Single-Engine Dynamic Composition Architecture

> **Status: FINAL ARCHITECTURE CONTRACT — FROZEN FOR IMPLEMENTATION**
>
> **Implementation rule:** documentation is updated first. Source code must then converge to this contract exactly. If implementation and this document disagree, implementation is wrong until this document is deliberately amended and re-frozen.
>
> This document supersedes the older multi-builder / returned-child-builder / raw-properties authoring direction. Stable wire contracts, Partner Auth behavior, validation strictness, Redis OTP behavior, API envelopes, destinations, and already-proven production behavior remain unchanged unless this document explicitly says otherwise.

---

## 1. Purpose

CarBroz uses Server-Driven UI (SDUI) so the backend can describe screens dynamically while Android/iOS/Desktop render a stable canonical JSON contract.

The architecture must be:

- simple to read and write;
- strongly typed;
- safe at runtime;
- extensible without modifying unrelated screens;
- reusable across Partner, Customer, and Admin applications;
- independent from business-domain ownership;
- free from duplicate builders, property frameworks, factories, validators and registries;
- suitable for long-term evolution without screen-specific rendering logic in the client.

The permanent ownership rule is:

> **One SDUI engine owns the complete presentation lifecycle: vocabulary → composition → property resolution → action authoring → screen resolution → validation → canonical output.**

Domains own business behavior. SDUI owns presentation. API surfaces own HTTP transport/adaptation only.

---

## 2. Permanent architectural principles

### 2.1 One engine

Canonical target module:

```text
sdui/engine
```

`sdui/ui-sdk` and `sdui/registry` are migration/compatibility sources until their remaining behavior is safely converged. They are not permanent parallel SDUI authoring engines.

### 2.2 Explicit hierarchy, fluent configuration

Hierarchy must be obvious from source code. Property configuration should be easy through dot-based fluent APIs.

The architecture intentionally separates:

```text
Hierarchy authoring     → template/component/section/group/element ownership
Property authoring      → base/style/content/behavior/metadata fluent categories
Action authoring        → generic typed action helpers
Final serialization     → canonical SDUI wire contract
```

### 2.3 Open/Closed evolution

The normal cost of extension is frozen:

```text
new screen       → create screen composer + register once
new node type    → create node definition + register once
new property     → extend only the owning node/capability contract
new action type  → extend generic action contract + runtime handler support
new event        → extend supported generic event vocabulary
existing screens → unchanged unless they intentionally adopt the feature
```

### 2.4 No hidden hierarchy state

Forbidden:

```text
currentComponent
currentSection
currentGroup
global mutable parent cursor
parent-ID lookup to determine ownership
manual cross-tree child attachment
screen-specific factory graphs
```

The lexical nesting of the composer must reveal the resulting UI tree.

### 2.5 No framework inside the framework

A new abstraction is allowed only when it:

1. enforces a real invariant;
2. represents a stable boundary; or
3. removes meaningful duplication.

No abstraction is allowed merely because a design pattern exists.

---

## 3. Canonical hierarchy

The hierarchy is frozen:

```text
Screen
  → Template
      → Component
          → Element
```

or:

```text
Screen
  → Template
      → Component
          → Section
              → Element
```

or:

```text
Screen
  → Template
      → Component
          → Section
              → Group
                  → Element
```

Mandatory rules:

1. Screen owns exactly one Template.
2. Template owns one or more Components.
3. Component owns Elements **XOR** Sections.
4. Section owns Elements **XOR** Groups.
5. Group owns Elements only.
6. Element is terminal.
7. Component cannot directly own Group.
8. Template cannot directly own Section, Group or Element.
9. Group cannot own Group or Section.
10. Element cannot own children.

The XOR rules are permanent:

```text
Component → Elements XOR Sections
Section   → Elements XOR Groups
```

The fluent composition API should make illegal combinations difficult or impossible, and the canonical validator must reject any invalid final document regardless of how it was produced.

---

## 4. Identity and reusable type semantics

Every node follows:

```text
id         = unique instance identity within the screen
type       = reusable generic rendering behavior
properties = resolved canonical values for this instance
children   = owned structural descendants where applicable
```

Examples:

```text
id   = login_content
type = stack_component

id   = mobile_number
type = input
```

Do not create screen-specific reusable types such as:

```text
partner_login_stack
otp_input_component
booking_submit_button
```

Reusable type meaning stays generic. Screen-specific content/configuration belongs in the screen composer.

---

## 5. Final design patterns

| Requirement | Pattern | Frozen reason |
|---|---|---|
| SDUI hierarchy | **Composite** | The document is naturally a structural tree. |
| Readable screen authoring | **Builder / Internal DSL** | Hierarchy is explicit while array assembly is hidden. |
| Dot-based node configuration | **Fluent Interface** | Developers configure only what they need with discoverable methods. |
| Screen variation | **Strategy via `ScreenComposer`** | Each screen implements the same build contract independently. |
| Screen lookup | **Registry** | `(targetApp, screenId)` resolves exactly one composer. |
| Generic actions | **Command-style typed data** | Runtime executes product-neutral action contracts. |
| Action execution | **Strategy/handler registry on client** | Each generic action type has isolated handling. |
| Validation | Exact schemas + semantic validation | Additional object-pattern hierarchy is unnecessary. |

There is **one SduiBuilder architecture**, not a public Builder class per reusable node type.

---

## 6. Target package structure

```text
sdui/engine/
├── package.json
├── tsconfig.json
├── src/
│   ├── core/
│   │   ├── SduiModel.ts
│   │   ├── SduiBuilder.ts
│   │   ├── SduiValidator.ts
│   │   ├── NodeDefinition.ts
│   │   ├── ScreenComposer.ts
│   │   └── ScreenContext.ts
│   │
│   ├── properties/
│   │   ├── BaseProperties.ts
│   │   ├── StyleProperties.ts
│   │   ├── ContentProperties.ts
│   │   ├── BehaviorProperties.ts
│   │   ├── MetadataProperties.ts
│   │   └── value-objects/
│   │       ├── Dimension.ts
│   │       ├── Spacing.ts
│   │       ├── Alignment.ts
│   │       ├── Arrangement.ts
│   │       ├── Background.ts
│   │       ├── Border.ts
│   │       ├── Shape.ts
│   │       └── Typography.ts
│   │
│   ├── actions/
│   │   ├── Action.ts
│   │   ├── ActionSchemas.ts
│   │   └── ValueReference.ts
│   │
│   ├── nodes/
│   │   ├── template/
│   │   ├── component/
│   │   ├── section/
│   │   ├── group/
│   │   ├── element/
│   │   └── definitions.ts
│   │
│   ├── screens/
│   │   ├── partner/
│   │   ├── customer/
│   │   └── admin/
│   │
│   ├── registry/
│   │   ├── NodeDefinitionRegistry.ts
│   │   └── ScreenRegistry.ts
│   │
│   ├── SduiService.ts
│   └── index.ts
└── tests/
```

Exact physical files may be combined where a split creates noise. Responsibility boundaries are frozen; unnecessary file proliferation is forbidden.

---

## 7. Node definition is the canonical owner of one reusable type

A reusable type such as `stack_template`, `stack_component`, `text`, `input` or `button` owns its exact contract in one definition.

Each definition owns:

- canonical `type`;
- hierarchy level;
- supported child/content mode;
- exact property schema;
- canonical default property values;
- supported property capabilities/categories;
- supported events when applicable;
- optional definition metadata used by validation.

Conceptually:

```ts
interface NodeDefinition<TProperties> {
  readonly type: string;
  readonly level: 'template' | 'component' | 'section' | 'group' | 'element';
  readonly properties: PropertyParser<TProperties>;
  readonly defaults: Partial<TProperties>;
  readonly children: SduiContentMode;
  readonly supportedEvents?: readonly SduiEventName[];
}
```

A developer opening one node definition must be able to understand what the type supports without searching through a separate screen-specific property architecture.

---

## 8. Property classification — frozen model

Every supported property belongs to one of five conceptual categories.

### 8.1 Base / default properties

Fundamental layout/rendering behavior of the node.

Typical examples:

```text
width
height
padding
margin
spacing
orientation / axis
mainAxisAlignment
crossAxisAlignment
arrangement
```

Where a node type has a safe universal value, it is stored in the node definition defaults and is emitted automatically even when the screen does not mention it.

Examples:

```text
padding = 0
margin = 0
spacing = 0
stack orientation = vertical
```

A screen may override any allowed default.

### 8.2 Style properties

Visual appearance that may be defaulted or may be instance-specific.

Typical examples:

```text
background
border
shape
elevation
alpha
color
fontSize
fontWeight
fontFamily
textAlign
lineHeight
letterSpacing
```

A style property is emitted automatically only if its owning definition has a canonical default; otherwise it appears only when the screen sets it.

### 8.3 Content / instance properties

Actual content or instance data. Usually there is no meaningful universal default.

Examples:

```text
text
imageUrl / resource
placeholder
label
icon
maxLines
```

These are emitted only when supplied, unless the owning node contract explicitly defines a safe default.

### 8.4 Behavior properties

Runtime interaction/configuration.

Examples:

```text
binding
validation
actions
enabled
visible
keyboardType
singleLine
```

They are generic capabilities, not feature-specific business behavior.

### 8.5 Metadata / semantic properties

Accessibility, semantic and runtime metadata.

Examples:

```text
semanticRole
contentDescription
testTag
```

Only metadata supported by the node definition is legal.

---

## 9. Default-property resolution — frozen semantics

The screen composer should not repeat canonical defaults.

For each node:

```text
canonical defaults from node definition
              +
explicit screen overrides / additions
              ↓
strict property validation
              ↓
canonical serialized properties
```

Rules:

1. Definition defaults are always present in final properties.
2. Screen code may override an allowed default.
3. A non-default property appears only when explicitly set.
4. Unknown properties are rejected; they are never silently dropped.
5. Default values are not mutated globally by one screen.
6. Screen-specific overrides affect only that node instance.
7. Nested object overrides use deterministic recursive merge semantics where supported.
8. Arrays are replaced as complete values; arrays are not element-by-element merged.
9. `undefined` means “no override”; the default remains.
10. Final resolved properties are validated after resolution.

Example definition:

```ts
stack_component.defaults = {
  width: 'match_parent',
  height: 'wrap_content',
  padding: { start: 0, top: 0, end: 0, bottom: 0 },
  margin: { start: 0, top: 0, end: 0, bottom: 0 },
  spacing: 0,
  orientation: 'vertical',
  mainAxisAlignment: 'start',
  crossAxisAlignment: 'stretch',
};
```

Screen authoring:

```ts
component.base()
  .spacing(14)
  .paddingHorizontal(24);
```

Final JSON still contains all canonical defaults; only `spacing` and horizontal padding are changed for that instance.

---

## 10. Fluent screen authoring — final API direction

The final authoring model is:

> **Explicit hierarchy methods + fluent dot-based property categories.**

Hierarchy methods must use hierarchy names, not type aliases.

Correct:

```ts
screen.template('form_template', 'tpl_partner_login', template => {
  template.component('stack_component', 'brand_content', component => {
    component.section('stack_section', 'brand_section', section => {
      section.group('stack_group', 'brand_group', group => {
        group.text('brand_name', text => {
          // properties
        });
      });
    });
  });
});
```

Do not use confusing hierarchy/type mixing such as:

```text
template.stack(...)
component.verticalStack(...)
```

`template()` creates a Template. `component()` creates a Component. `section()` creates a Section. `group()` creates a Group. The first argument identifies the reusable type.

### 10.1 Terminal convenience methods

For common Elements, legal parent scopes may expose:

```text
text()
image()
input()
button()
icon()
divider()
spacer()
```

These are convenience methods over generic element creation, not separate Builder architectures.

A generic escape hatch remains available internally/publicly where required:

```ts
scope.element('rating', 'service_rating', element => { ... });
```

Adding a new node type must not force a rewrite of `SduiBuilder`; a convenience method may be added later only if the type becomes common enough to justify it.

---

## 11. Fluent property categories

Each current node scope exposes only the categories/capabilities legal for that node.

Conceptual developer experience:

```ts
text.content()
  .text('Welcome Partner!');

text.style()
  .fontSize(32)
  .fontWeight(700)
  .textAlign('center');

text.metadata()
  .contentDescription('Welcome heading');
```

Layout-capable structural node:

```ts
component.base()
  .spacing(14)
  .paddingHorizontal(24)
  .crossAxisAlignment('center');

component.style()
  .background('#FFFFFF');
```

Input:

```ts
input.content()
  .placeholder('98765 43210');

input.behavior()
  .binding('mobileNumber')
  .keyboardType('phone')
  .required()
  .regex(MOBILE_REGEX);
```

Button:

```ts
button.content()
  .text('Continue');

button.behavior()
  .onClick(action.request(...));
```

### 11.1 Type safety

Autocomplete must expose only legal capabilities.

These must fail at compile time or final validation:

```ts
image.style().fontSize(20);        // illegal
text.behavior().keyboardType('phone'); // illegal
```

The system must not expose one unrestricted giant property bag to every node.

### 11.2 Internal implementation constraint

Do not create public classes such as:

```text
TextBuilder
ImageBuilder
InputBuilder
ButtonBuilder
StackTemplateBuilder
StackComponentBuilder
```

Small internal reusable fluent capability scopes are allowed, for example:

```text
BasePropertyScope
StylePropertyScope
ContentPropertyScope
BehaviorPropertyScope
MetadataPropertyScope
```

They are views over the current node/configuration and must not become a second hierarchy framework.

---

## 12. Canonical Login authoring target

The Partner Login screen becomes the Golden Reference before OTP migration.

Conceptual target style:

```ts
return sdui.screen(
  {
    id: 'partner_login',
    targetApp: 'PARTNER',
    theme: partnerAuthTheme,
  },
  screen => {
    screen.template('stack_template', 'tpl_7K2M9Q', template => {
      template.base()
        .spacing(24)
        .paddingHorizontal(24);

      template.component('stack_component', 'brand_content', brand => {
        brand.base()
          .spacing(6)
          .crossAxisAlignment('center');

        brand.image('brand_logo', image => {
          image.content().resource('carbroz_logo');
          image.base().width(120).height(96);
        });

        brand.text('brand_name', text => {
          text.content().text('CarBroz');
          text.style().fontSize(44).fontWeight(700);
        });
      });

      template.component('stack_component', 'login_content', login => {
        login.base().spacing(14);

        login.section('stack_section', 'mobile_field_section', section => {
          section.group('stack_group', 'mobile_field', group => {
            group.input('mobile_number', input => {
              input.content().placeholder('98765 43210');
              input.behavior()
                .binding('mobileNumber')
                .keyboardType('phone')
                .required()
                .regex(MOBILE_REGEX);
            });
          });
        });

        login.section('stack_section', 'action_section', section => {
          section.button('continue_button', button => {
            button.content().text('Continue');
            button.behavior().onClick(
              action.request({
                method: 'POST',
                endpoint: '/api/v1/partner/auth/send_otp',
                authentication: 'NONE',
                validate: true,
                responseMode: 'destination',
                body: {
                  phoneNumber: ref.binding('mobileNumber'),
                  deviceId: ref.context('deviceId'),
                },
              }),
            );
          });
        });
      });
    });
  },
);
```

This example is an authoring model. The **wire output must remain exactly compatible** with the already-frozen Partner Login contract.

---

## 13. Actions — complete generic vocabulary

The backend must support the frozen generic action vocabulary:

```text
request
navigate
present
dismiss
state
external_uri
sequence
```

Public authoring should be grouped under one discoverable namespace:

```ts
action.request(...)
action.navigate(...)
action.present(...)
action.dismiss(...)
action.state(...)
action.externalUri(...)
action.sequence(...)
```

Value references should be grouped under:

```ts
ref.binding(...)
ref.context(...)
ref.response(...)
ref.literal(...)
```

Canonical serialization remains:

```json
{ "$binding": "mobileNumber" }
{ "$context": "deviceId" }
{ "$response": "data.challengeId" }
{ "$literal": "value" }
```

No fluent ActionBuilder class hierarchy is authorized.

### 13.1 Event-keyed actions

Elements declare generic event-keyed actions:

```ts
button.behavior()
  .onClick(action.request(...))
  .onLongClick(action.present(...));
```

Examples of generic events:

```text
onClick
onLongClick
onValueChange
onFocus
onBlur
```

Node definitions should declare supported events where this can be enforced without duplication. Unsupported events are rejected.

### 13.2 Request-dependent navigation

When navigation depends on request success:

```text
request + responseMode = destination
```

must be used.

Do **not** model this as:

```text
sequence(request, navigate)
```

because failed requests must not navigate.

### 13.3 Independent navigation

Use `action.navigate(destination)` when navigation does not depend on a preceding business mutation.

### 13.4 Present/dismiss

`present` supports product-neutral overlays such as:

```text
dialog
bottom_sheet
popup
```

`dismiss` closes the active or targeted presentation.

### 13.5 State actions

State actions operate on semantic runtime state, not structural tree mutation.

Allowed operations begin with:

```text
set
toggle
```

Allowed semantic targets include:

```text
visible
enabled
selected
expanded
checked
loading
value
```

Arbitrary mutation such as `background.color` is forbidden.

### 13.6 External URI and sequence

`external_uri` delegates to platform-safe URI handling. `sequence` is only for genuinely ordered independent generic actions.

The full canonical wire-level contract remains in `sdui/ui-sdk/ACTION-CONTRACT.md` during migration and must converge into engine ownership without changing semantics.

---

## 14. Destination and API request contract

Canonical Destination remains:

```text
screenId
templateId
templateType
endpoint
method
authentication
```

Loaded screen identity remains:

```text
screen.screenId
screen.schemaVersion
screen.targetApp
screen.template.id
screen.template.type
```

After destination fetch:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

The client must not infer routes from screen/template IDs.

Request action flow with `responseMode: destination`:

```text
validate applicable bindings/inputs
→ resolve ref.* values
→ execute request
→ failure: expose/reduce error and DO NOT navigate
→ success: retain required transient response/context
→ validate returned destination
→ satisfy destination authentication requirement
→ fetch destination screen
→ verify destination/screen identity parity
→ navigate/render
```

Business request endpoints remain owned by their bounded contexts. The SDUI engine emits typed intent only.

---

## 15. Theme

Theme is typed configuration, not structural hierarchy.

Theme helpers may exist for reusable stable values, but no ThemeBuilder hierarchy is required.

Screen-specific theme values must not create screen inheritance or base-screen classes.

---

## 16. ScreenComposer contract

Every product screen lives under:

```text
sdui/engine/src/screens/<app>/
```

Canonical contract:

```ts
export interface ScreenComposer {
  readonly screenId: string;
  readonly targetApp: TargetApp;
  build(context: ScreenContext): SduiScreen;
}
```

Rules:

- composers are stateless or effectively immutable;
- composers build presentation only;
- no Fastify request/response objects;
- no repository locator/service-locator `ScreenContext`;
- no direct database/Redis/network provider access;
- no domain business-policy ownership;
- no inheritance between product screens;
- shared immutable theme/config helpers are allowed when genuinely reusable.

---

## 17. Screen registration — create + register once

Adding a new screen must require exactly:

```text
1. create MyScreen.ts
2. register MyScreen once
3. done
```

Prefer explicit deterministic registration:

```ts
export const partnerScreens = [
  new PartnerLoginScreen(),
  new PartnerOtpScreen(),
  new PartnerDashboardScreen(),
];
```

Then:

```ts
new ScreenRegistry([
  ...partnerScreens,
  ...customerScreens,
  ...adminScreens,
]);
```

`ScreenRegistry` key:

```text
(targetApp, screenId)
```

It must reject duplicates and unknown screens.

Filesystem magic/automatic runtime discovery is not required. Explicit registration is searchable, deterministic and testable.

---

## 18. NodeDefinitionRegistry

Every reusable node definition is registered once.

It must:

- reject duplicate type registration;
- reject unknown type resolution;
- preserve hierarchy level/type identity;
- expose definitions to builder/property resolution and validator;
- avoid global mutable side-effect registration.

There must not be a second definition/property registry elsewhere.

---

## 19. SduiService — single public orchestration entry

The canonical flow is:

```text
(targetApp, screenId, context)
      ↓
ScreenRegistry
      ↓
ScreenComposer
      ↓
SduiBuilder + property resolution
      ↓
SduiValidator
      ↓
canonical SduiScreen
```

`SduiService` is the engine's public orchestration entry for dynamic screen resolution.

API surfaces should request a screen from the service and serialize/return it; they must not build SDUI trees themselves.

---

## 20. Validation — defense in depth

Builder type safety never replaces final validation.

Required validation stages:

1. root structural validation;
2. hierarchy/XOR validation;
3. node definition existence;
4. exact property schema validation after defaults/overrides resolve;
5. event/action compatibility validation;
6. semantic/invariant validation;
7. schema-version validation;
8. target-app validation;
9. publication validation where persisted lifecycle semantics apply.

Invalid values must never be repaired, silently dropped, coerced into unrelated meaning or bypassed because a Builder produced them.

Minimum stable error categories:

```text
UNKNOWN_SCREEN
DUPLICATE_SCREEN_REGISTRATION
INVALID_SCREEN_ROOT
INVALID_HIERARCHY
UNKNOWN_NODE_DEFINITION
INVALID_NODE_PROPERTIES
INVALID_ACTION
UNSUPPORTED_EVENT
UNSUPPORTED_SCHEMA_VERSION
INVALID_TARGET_APP
PUBLICATION_VALIDATION_FAILED
```

---

## 21. Persisted Registry lifecycle migration

Existing `sdui/registry` lifecycle may still own persisted draft/version/publish/archive/retrieve behavior during migration.

That lifecycle must eventually consume the engine's canonical model and validation, not redefine them.

Do not delete persisted registry behavior until reference, route, migration, version-history and production-data analysis proves removal/convergence safe.

Final ownership target:

```text
engine → vocabulary/composition/property/action/validation authority
registry lifecycle → persistence/publication capability consuming engine contracts
```

If the registry remains a separate package for persistence reasons, it is not allowed to become a second SDUI language or screen-composition framework.

---

## 22. Partner Auth contracts that must not change

### Login

```text
screenId      = partner_login
template.id   = tpl_7K2M9Q
template.type = stack_template
targetApp     = PARTNER
GET /api/v1/partner/screen/auth_login
```

Continue request:

```text
POST /api/v1/partner/auth/send_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Body:

```text
phoneNumber ← ref.binding('mobileNumber')
deviceId    ← ref.context('deviceId')
```

### Send OTP destination

```text
screenId       = partner_otp
templateId     = tpl_partner_otp_v1
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

### OTP verify request

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Body references:

```text
challengeId ← ref.response('data.challengeId')
phoneNumber ← ref.context('authFlow.phoneNumber')
otp         ← ref.binding('otp')
deviceId    ← ref.context('deviceId')
```

### Authenticated Dashboard destination

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

### OTP persistence

Production OTP challenge persistence remains Redis-only. No Prisma/in-memory production fallback, dual-write, OTP plaintext response or duplicate challenge owner may be introduced.

---

## 23. Compatibility and migration rules

Use:

```text
KEEP   → already-correct behavior/contracts
EXTEND → missing capability without breaking owners
MODIFY → wrong ownership/authoring architecture
CREATE → genuinely missing target capability
DELETE → only after zero-reference/proof
```

Temporary compatibility is allowed only when:

- exact callers are known;
- the compatibility path delegates to the canonical engine;
- parity tests prove output;
- an explicit retirement condition exists.

Compatibility must never become a second permanent authoring path.

---

## 24. Revised implementation sequence — exact order

Implementation starts only after this documentation set is synchronized.

### Phase 0 — documentation freeze and source audit

- freeze this contract and action/API handoff contracts;
- inspect current engine implementation against the frozen design;
- identify deltas without changing behavior;
- preserve the already-green Login wire output as parity oracle.

### Phase 1 — property model foundation

- introduce the five property categories;
- establish reusable value objects/capabilities;
- define deterministic default + override resolution;
- keep exact strict schemas;
- test default emission, overrides, optional omission, nested-object merge and array replacement.

### Phase 2 — fluent property scopes

- add `base()`, `style()`, `content()`, `behavior()`, `metadata()` fluent scopes;
- expose only capabilities legal for each node type;
- avoid per-node public Builder proliferation;
- prove invalid cross-node properties are rejected.

### Phase 3 — hierarchy DSL refinement

- keep explicit `template/component/section/group` hierarchy methods;
- add terminal convenience methods for common Elements;
- retain generic `element(type, ...)` escape hatch;
- preserve XOR enforcement and no hidden parent cursor.

### Phase 4 — complete action authoring

- move/group references under `ref`;
- provide `action.request/navigate/present/dismiss/state/externalUri/sequence`;
- preserve frozen action wire contract;
- add supported-event validation where appropriate.

### Phase 5 — screen registration simplification

- explicit app screen lists;
- one ScreenRegistry composition point;
- duplicate/unknown tests;
- new-screen workflow proven as create + register once.

### Phase 6 — Partner Login Golden Reference migration

- rewrite Login composer to the frozen fluent DSL;
- preserve exact screen identity, theme, hierarchy and action contract;
- deep-equality/parity proof against the current canonical Login output;
- remove obsolete Login authoring path only after zero production refs;
- all existing Login tests remain green.

### Phase 7 — Partner OTP migration

Only after Login Golden Reference is green:

- compose OTP with `form_template` through the same DSL;
- preserve exact OTP contract and transient references;
- parity test against existing expected wire behavior;
- no OTP-specific actions or business logic in SDUI.

### Phase 8 — Partner Dashboard migration

- move remaining screen composition into engine ownership;
- preserve authenticated registry destination/runtime lifecycle behavior;
- remove duplicate API/domain screen composition after reference proof.

### Phase 9 — remove duplicate screen ownership

- audit `apps/api` and `domains/*/presentation/sdui`;
- delete only proven stale/unreferenced screen builders;
- architecture gate: product screens only under engine `screens/<app>`.

### Phase 10 — converge persisted registry lifecycle

- consume engine canonical schemas/validator;
- remove reusable vocabulary duplication;
- retain required publication/version functionality.

### Phase 11 — migrate remaining screens

- Partner → Customer → Admin as prioritized;
- create + register only;
- reuse generic node/action/property vocabulary.

### Phase 12 — retire old ui-sdk/compatibility packages

Only after zero production references and test proof.

### Phase 13 — final forensic audit and freeze

Prove:

- one SDUI language;
- one composition engine;
- one definition registry;
- one validator authority;
- one screen owner per screen;
- exact Partner Auth behavior preserved;
- no weak validation;
- no duplicate OTP persistence;
- full build/lint/test/coverage/freeze gates green.

---

## 25. Golden tests required before and during migration

At minimum:

- default properties always emitted;
- allowed default override works per instance;
- screen A override does not mutate screen B/default definition;
- non-default property omitted unless set;
- nested default object merge is deterministic;
- arrays replace rather than merge;
- exact property schema rejects unknown keys;
- hierarchy/XOR rules reject invalid composition;
- node registry rejects duplicates/unknowns;
- screen registry rejects duplicates/unknowns;
- each action helper serializes exactly to canonical wire form;
- unsupported events are rejected where metadata is defined;
- Login before/after canonical deep equality;
- OTP before/after canonical deep equality;
- API transport/auth behavior unchanged;
- Redis-only OTP persistence unchanged.

---

## 26. Permanent anti-patterns

Do not introduce:

```text
screen-specific reusable node types
screen inheritance/base-screen classes
public Builder class per node type
giant unrestricted properties object
global mutable builder cursor
factory-of-factory composition
feature-specific action types
manual $binding/$context/$response wire objects in screen composers
request + navigate sequence for dependent navigation
SDUI business logic in domains
SDUI tree construction in API surfaces
second canonical validator
second node definition registry
silent property dropping or validation weakening
```

---

## 27. Final developer mental model

A developer adding a screen should think only:

```text
What is the hierarchy?
  template → component → section/group → element

What does this node need to differ from its defaults?
  base/style/content/behavior/metadata fluent methods

What interaction should happen?
  action.* using ref.* values

Where is the screen available?
  register once by targetApp + screenId
```

Everything else—canonical defaults, exact schemas, hierarchy safety, action wire serialization, validation and final output—is engine responsibility.

---

## 28. Final frozen architecture statement

> **CarBroz SDUI is one Composite presentation model authored through one small internal Builder DSL. Hierarchy is explicit through Template/Component/Section/Group/Element scopes. Node configuration is fluent and discoverable through Base, Style, Content, Behavior and Metadata property categories. Every reusable node definition owns its exact schema and canonical defaults; defaults are emitted automatically and screens specify only intentional overrides or instance-specific values. Generic typed actions are authored through `action.*` and values through `ref.*`. Product screens are independent `ScreenComposer` strategies registered exactly once by `(targetApp, screenId)`. `SduiService` resolves, builds, validates and returns one canonical SDUI document. No domain, API surface, legacy SDK or registry lifecycle may become a second SDUI authoring authority.**
