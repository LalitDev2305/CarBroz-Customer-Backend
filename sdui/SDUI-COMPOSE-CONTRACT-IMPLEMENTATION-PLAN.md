# CarBroz SDUI Dynamic Composition Architecture & Implementation Guide

> **Status:** ARCHITECTURE DECISION FROZEN FOR IMPLEMENTATION. This freezes the target architecture only; production SDUI composition remains open until source convergence, documentation, canonical CI, Architecture Closeout, and the final forensic audit are complete on the same SHA.

## 1. Purpose

This document is the canonical implementation contract for CarBroz backend SDUI composition.

It replaces the earlier assumption that product screens may manually construct the final nested SDUI JSON tree and then call `screenSchema.parse(...)`. The final architecture preserves the existing hierarchy and legitimate `ui-sdk` / runtime Registry ownership while making typed object-graph Builders the canonical screen-authoring path.

No migrated production screen may manually assemble the final `components`, `sections`, `groups`, or `elements` arrays.

Implementation follows:

```text
KEEP → EXTEND → MODIFY → CREATE
```

Existing legitimate owners are strengthened. A parallel SDUI engine, second validator framework, duplicate definition registry, duplicate serializer, or screen-specific primitive framework is forbidden.

## 2. Canonical Hierarchy

The hierarchy is frozen:

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
3. Component contains Elements **OR** Sections, never both.
4. Section contains Elements **OR** Groups, never both.
5. Group contains Elements only.
6. Element is terminal.
7. Component cannot directly contain Group.
8. Template cannot directly contain Section, Group, or Element.
9. Group cannot contain Group or Section.
10. Element cannot contain children.

The two XOR rules are mandatory:

```text
Component → Elements XOR Sections
Section   → Elements XOR Groups
```

They must be enforced by the Builder API and again by final canonical validation.

## 3. Core Semantic Model

Every node follows:

```text
id          = instance identity
type        = reusable behavior definition
properties  = values for this instance
children    = hierarchy owned by this instance when allowed
```

Example:

```text
id   = login_content
type = stack_component
```

Do not create screen-specific reusable primitive types such as:

```text
login_stack_component
otp_stack_component
dashboard_stack_component
login_text
otp_button
```

Reusable type remains generic. Screen-specific values remain in the screen-specific Builder.

## 4. Ownership Model

### 4.1 `ui-sdk` owns HOW SDUI is built

`ui-sdk` owns:

- canonical contracts and structural schemas;
- shared atomic property schemas;
- reusable definitions and definition registries;
- definition-specific property contracts;
- typed reusable node Builders;
- the root Screen Builder;
- hierarchy/object-graph ownership;
- factories where legitimately required;
- hierarchy/property/definition/invariant/version validation;
- publication validation support;
- action/binding/value-reference vocabulary;
- typed action authoring Builders;
- typed theme authoring Builders;
- serializer;
- schema compatibility/versioning;
- public exports.

`ui-sdk` must not know business screens such as Partner Login, OTP, Dashboard, Booking, or Catalog screens.

### 4.2 Owning domain/surface owns WHAT the screen contains

A screen-specific Builder owns:

- screen ID;
- node instance IDs;
- reusable type selection through typed methods;
- screen-specific property values;
- text/content;
- actions and bindings;
- validation values;
- analytics/accessibility values where applicable;
- exact composition.

Examples:

```text
PartnerLoginScreenBuilder
PartnerOtpScreenBuilder
PartnerDashboardScreenBuilder
```

These are orchestration classes only. They must consume the reusable `ui-sdk` authoring language and must not become a second SDUI framework.

### 4.3 Runtime Registry owns document lifecycle

The runtime Registry owns:

```text
CREATE draft
UPDATE draft
VALIDATE draft
PUBLISH
ARCHIVE
RETRIEVE published version
VERSION HISTORY
ROLLBACK when already legitimately supported
```

The Registry must not redefine canonical `ui-sdk` Template, Component, Section, Group, or Element behavior.

## 5. Property Architecture

### 5.1 Shared atomic property vocabulary

Reusable atomic concepts live centrally under:

```text
sdui/ui-sdk/src/properties/
```

Examples include:

```text
layout:
- orientation
- arrangement
- alignment
- spacing
- size

appearance:
- color
- background
- border
- shape

accessory:
- accessory
```

### 5.2 Definition-specific final property contracts

There is no single global final `stack-properties.schema.ts` contract.

Final property contracts live with the reusable definition that owns them:

```text
StackTemplateProperties
StackComponentProperties
StackSectionProperties
StackGroupProperties
TextProperties
ImageProperties
IconProperties
InputProperties
ButtonProperties
DividerProperties
SpacerProperties
```

Atomic schemas may be reused by several definitions, but each definition independently owns the exact final property set it accepts.

### 5.3 No arbitrary property bag as normal authoring API

Known production definitions must expose semantic typed methods instead of making a generic `setProperties({...})` or arbitrary `Record<string, unknown>` bag the normal screen API.

Preferred examples:

```ts
.vertical()
.horizontal()
.spacing(16)
.padding(...)
.fillMaxWidth()
.fillMaxSize()
.alignCenter()
.background(...)
.border(...)
.shape(...)
.fontSize(...)
.fontWeight(...)
.value(...)
.placeholder(...)
.required()
.maxLength(...)
```

Internally, Builders may store typed property state. Screen-specific composition code must not manipulate arbitrary known-definition property bags.

## 6. Final Builder Architecture — Returned Object References

### 6.1 Returned Builder objects are the PRIMARY API

The canonical screen-authoring style is returned-object composition.

Root configuration is explicit and fluent:

```ts
const screen = new SduiScreenBuilder();

screen
  .id('partner_login')
  .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
  .targetApp('PARTNER');
```

Template creation returns the exact Template Builder:

```ts
const template = screen.addStackTemplate('partner_login_template');

template
  .vertical()
  .fillMaxSize()
  .padding({ start: 24, top: 20, end: 24, bottom: 20 });
```

Multiple Components may be created first and configured later:

```ts
const component1 = template.addStackComponent('brand_component');
const component2 = template.addStackComponent('login_component');
const component3 = template.addStackComponent('footer_component');

component1.vertical().spacing(8).alignCenter();
component2.vertical().spacing(16).fillMaxWidth();
component3.horizontal().spacing(12).alignCenter();
```

There is no requirement that configuration must immediately follow creation.

### 6.2 Builder object instance owns its state

The exact Builder object stores:

- its instance identity;
- typed properties;
- its owned child Builder references when children are legal;
- definition-specific state required for semantic methods.

Configuration order does not define hierarchy.

Object reference defines hierarchy.

These are both valid:

```ts
const component = template.addStackComponent('login_component');
component.vertical().spacing(16);
```

and:

```ts
const component1 = template.addStackComponent('one');
const component2 = template.addStackComponent('two');
const component3 = template.addStackComponent('three');

component1.vertical();
component2.horizontal();
component3.vertical();
```

### 6.3 Object reference defines parentage

Example:

```ts
const component1 = template.addStackComponent('component_1');
const component2 = template.addStackComponent('component_2');

const section1 = component1.addStackSection('section_1');
const section2 = component2.addStackSection('section_2');
```

`section1` belongs to `component1` because `component1` created and owns it.

`section2` belongs to `component2` because `component2` created and owns it.

Normal composition must not use:

```text
currentComponent
currentSection
currentGroup
global mutable composition cursor
parent-ID lookup
manually managed child arrays
```

### 6.4 Configuration may occur before or after child creation

Properties and children are independent Builder state until finalization.

All of the following is valid when hierarchy/XOR rules are respected:

```ts
const component = template.addStackComponent('login');
component.vertical();

const section = component.addStackSection('mobile');

component.spacing(16);
section.vertical();
```

and:

```ts
const section = component.addStackSection('mobile');
section.vertical();

component
  .vertical()
  .spacing(16);
```

## 7. Method Name Defines Reusable Type

When a typed creation method exists, screen-specific code supplies the instance ID only.

Do not write:

```ts
template.addComponent('login_component', 'stack_component');
```

Use:

```ts
template.addStackComponent('login_component');
```

The method name determines the reusable type:

```text
screen.addStackTemplate(...)    → stack_template
template.addStackComponent(...) → stack_component
component.addStackSection(...)  → stack_section
section.addStackGroup(...)      → stack_group
group.addText(...)              → text
group.addInput(...)             → input
group.addButton(...)            → button
```

The same rule applies to other typed Template and Element methods such as `addFormTemplate`, `addDefaultTemplate`, `addImage`, `addIcon`, `addDivider`, and `addSpacer`.

## 8. Hierarchy-Safe Public APIs

### Template

Template may create Components only.

Valid:

```ts
template.addStackComponent(...)
```

Template must not expose direct Section, Group, or Element creation APIs under the frozen hierarchy.

### Component

Component exposes direct Elements **OR** Sections.

Valid examples:

```ts
component.addText(...)
component.addInput(...)
component.addButton(...)
component.addStackSection(...)
```

Invalid:

```ts
component.addStackGroup(...)
```

Once direct Elements exist, adding a Section must fail. Once Sections exist, adding a direct Element must fail.

### Section

Section exposes direct Elements **OR** Groups.

Valid examples:

```ts
section.addText(...)
section.addButton(...)
section.addStackGroup(...)
```

Once direct Elements exist, adding a Group must fail. Once Groups exist, adding a direct Element must fail.

### Group

Group exposes Elements only.

It must not expose Section or Group creation.

### Element

Element is terminal and exposes no child-adding API.

## 9. Element Builder Return Style

Element creation also returns the exact typed Builder:

```ts
const title = component.addText('title');

title
  .value('CarBroz Partner')
  .fontSize(28)
  .fontWeight(700);
```

Likewise:

```ts
const image = component.addImage('logo');
const input = group.addInput('mobile_number');
const button = section.addButton('continue');
const divider = component.addDivider('divider');
const spacer = component.addSpacer('space');
```

Convenience constructor values may remain where already legitimate, but the returned object remains the primary ownership/configuration model.

## 10. Typed Action Builder

The existing canonical action contract remains authoritative. Do not create a second action language.

However, production screen composition must not require giant nested raw request objects such as:

```ts
.onClick({
  type: 'request',
  payload: {
    method: 'POST',
    endpoint: '/api/v1/partner/auth/send_otp',
    authentication: 'NONE',
    validate: true,
    body: {
      phoneNumber: { $binding: 'mobileNumber' },
      deviceId: { $context: 'deviceId' },
    },
    responseMode: 'destination',
  },
});
```

The typed semantic authoring direction is:

```ts
const request = continueButton.onClickRequest();

request
  .method('POST')
  .endpoint('/api/v1/partner/auth/send_otp')
  .authentication('NONE')
  .validate(true)
  .responseMode('destination');

const body = request.body();
body.binding('phoneNumber', 'mobileNumber');
body.context('deviceId', 'deviceId');
```

The action Builder must serialize to the existing canonical `SduiAction` contract.

Screen-specific code must not need to know that references serialize as:

```json
{ "$binding": "mobileNumber" }
```

or:

```json
{ "$context": "deviceId" }
```

The typed body Builder owns that translation.

Required typed body source helpers include the existing canonical value-reference concepts where used by production flows:

```text
binding
context
response
literal
```

The implementation must remain small and reuse the existing action/value-reference schemas.

## 11. Typed Theme Builder

Production screen composition must not require a giant nested raw theme object such as:

```ts
screen.withTheme({
  theme: 'light',
  statusBar: 'transparent',
  properties: {
    gradient: {
      type: 'linear',
      angle: 135,
      colors: [...]
    }
  }
});
```

The canonical screen API exposes a typed Theme Builder:

```ts
const theme = screen.theme();

theme
  .light()
  .statusBarTransparent();

const gradient = theme.linearGradient();

gradient
  .angle(135)
  .addColor('#DDF8F6', 0)
  .addColor('#F7FEFD', 0.28)
  .addColor('#FFFFFF', 0.55)
  .addColor('#D9F7F4', 1);
```

Exact internal representation remains compatible with the existing serialized theme contract. Raw nested theme objects are not the normal production composition API.

## 12. Root Screen Builder

The canonical root authoring API is a no-argument Builder with explicit fluent configuration:

```ts
const screen = new SduiScreenBuilder();

screen
  .id('partner_login')
  .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
  .targetApp('PARTNER');
```

The root Builder:

- owns exactly one Template Builder;
- owns optional typed Theme Builder state;
- owns screen identity/version/target state;
- recursively finalizes the object graph;
- rejects missing required root state;
- invokes canonical layered validation before returning `SduiScreen`.

A compatibility wrapper/subclass may remain temporarily only when source usage proves it is required. It must delegate to the canonical root Builder and must not remain the preferred production screen API.

## 13. Final `screen.build()` Responsibility

`screen.build()` is the recursive finalization point:

```text
screen.build()
    ↓
template.build()
    ↓
components build
    ↓
sections build
    ↓
groups build
    ↓
elements build
    ↓
canonical contracts
    ↓
layered validation
    ↓
SduiScreen
```

Screen-specific code never manually creates final child arrays.

## 14. Canonical Screen Example

The following demonstrates the final authoring style. Exact visual values remain screen-owned.

```ts
export class PartnerLoginScreenBuilder {
  build(): SduiScreen {
    const screen = new SduiScreenBuilder();

    screen
      .id('partner_login')
      .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
      .targetApp('PARTNER');

    const theme = screen.theme();
    theme.light().statusBarTransparent();

    const gradient = theme.linearGradient();
    gradient
      .angle(135)
      .addColor('#DDF8F6', 0)
      .addColor('#F7FEFD', 0.28)
      .addColor('#FFFFFF', 0.55)
      .addColor('#D9F7F4', 1);

    const template = screen.addStackTemplate('tpl_partner_login');
    template.vertical().fillMaxSize();

    const brand = template.addStackComponent('brand_component');
    const form = template.addStackComponent('login_component');

    brand.vertical().alignCenter().spacing(8);

    const title = brand.addText('brand_title');
    title
      .value('CarBroz Partner')
      .fontSize(28)
      .fontWeight(700);

    form.vertical().spacing(16).fillMaxWidth();

    const mobileSection = form.addStackSection('mobile_section');
    const mobileGroup = mobileSection.addStackGroup('mobile_group');
    mobileGroup.horizontal().spacing(8).alignCenter();

    const countryCode = mobileGroup.addText('country_code');
    countryCode.value('+91');

    const mobile = mobileGroup.addInput('mobile_number');
    mobile
      .bind('mobileNumber')
      .phone()
      .required()
      .maxLength(10);

    const actionSection = form.addStackSection('action_section');
    const continueButton = actionSection.addButton('continue_button');
    continueButton.text('Continue').fillMaxWidth();

    const request = continueButton.onClickRequest();
    request
      .method('POST')
      .endpoint('/api/v1/partner/auth/send_otp')
      .authentication('NONE')
      .validate(true)
      .responseMode('destination');

    const body = request.body();
    body.binding('phoneNumber', 'mobileNumber');
    body.context('deviceId', 'deviceId');

    return screen.build();
  }
}
```

## 15. Validation Model

Validation is defense in depth and remains authoritative even when Builders are hierarchy-safe.

Required layers:

1. **JSON / structural** — canonical shape and required fields.
2. **Hierarchy** — legal parent/child relationships and XOR branches.
3. **Definition existence** — every reusable `type` resolves to a registered canonical definition.
4. **Definition-specific properties** — properties satisfy the exact strict schema for that definition.
5. **Semantic/invariant validation** — cross-field and semantic constraints.
6. **Schema version / target app** — compatibility and target validation.
7. **Publication validation** — publication requirements before activation.

The same canonical validation path must protect runtime Registry publication/retrieval boundaries.

## 16. Registry Lifecycle Boundary

The intended runtime flow is:

```text
Domain Screen Builder
        ↓
Canonical SduiScreen
        ↓
Canonical Validator
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

Runtime Registry node-catalog compatibility APIs may remain only where source usage proves they are required. They must not redefine canonical production `ui-sdk` types.

Existing Registry safeguards that prevent runtime redefinition of canonical `ui-sdk` Component, Section, Group, and Element types must be preserved.

## 17. Partner Auth Compatibility

This SDUI campaign must not redesign frozen Partner Auth business behavior.

OTP challenge storage remains Redis-only. Prisma OTP persistence must not be reintroduced.

Frozen destination contracts remain compatible.

Send OTP destination:

```text
screenId       partner_otp
templateId     tpl_partner_otp_v1
templateType   form_template
endpoint       /api/v1/partner/screen/auth_otp
method         GET
authentication NONE
```

Authenticated destination:

```text
screenId       partner_dashboard
templateId     partner_dashboard_template
templateType   default_template
endpoint       /api/v1/partner/sdui/registry/partner_dashboard
method         GET
authentication SESSION
```

Existing wrapper functions may remain stable for API compatibility:

```text
createPartnerLoginScreen()
createPartnerOtpScreen()
createPartnerDashboardScreen()
```

Internally they must delegate to their screen-specific Builders.

## 18. Screen Migration Rule

Partner Login remains the design-quality golden reference.

Within the continuous campaign:

1. make Login conform fully to the final Builder language;
2. apply exactly the same authoring language to OTP;
3. apply exactly the same authoring language to Dashboard;
4. do not invent per-screen Builder variants.

Different screens supply different values. The reusable Builder language stays the same.

## 19. Rejected Anti-Patterns

The following are explicitly rejected:

- giant raw production screen JSON constructors;
- `screenSchema.parse({ giant nested object })` as screen composition;
- screen-specific primitive definitions;
- screen-specific duplicates of SDK property contracts;
- one global final Stack property contract;
- generic arbitrary `setProperties({...})` as the normal known-definition API;
- hidden current-parent state;
- parent-ID based normal composition;
- manually owned final child arrays in screen-specific code;
- callbacks as the mandatory/primary child composition style;
- direct raw nested request objects in migrated production screens;
- direct raw nested theme-gradient objects in migrated production screens;
- Registry redefining canonical SDK types;
- a second action engine;
- a second hierarchy framework;
- a second serializer or validator framework;
- façade-on-façade APIs that make screen authoring harder instead of simpler.

## 20. Continuous Implementation Campaign

Phase A source reconciliation, Phase B typed atomic/definition properties, and Phase C typed reusable builders are historical verified milestones.

The remaining work is one continuous implementation campaign. Internal sequencing may be used for engineering discipline, but implementation must not stop for approval after every stage.

Current campaign order:

```text
canonical document convergence
        ↓
root returned-object Screen Builder
        ↓
typed Theme Builder
        ↓
typed Request / RequestBody Builder
        ↓
Login golden-reference convergence
        ↓
OTP convergence
        ↓
Dashboard convergence
        ↓
validator convergence
        ↓
Registry lifecycle / compatibility convergence
        ↓
retire or justify obsolete raw paths
        ↓
module documentation
        ↓
unit + integration + E2E verification
        ↓
canonical Backend CI
        ↓
Architecture Closeout on exact same SHA
        ↓
second-pass forensic audit
```

## 21. Test Requirements

Tests must prove behavior rather than merely snapshot giant JSON literals.

### Atomic properties

Cover valid/invalid orientation, spacing, size, alignment, arrangement, appearance contracts, and strict unknown-property rejection.

### Definition-specific properties

Cover:

```text
StackTemplateProperties
StackComponentProperties
StackSectionProperties
StackGroupProperties
TextProperties
ImageProperties
IconProperties
InputProperties
ButtonProperties
DividerProperties
SpacerProperties
```

### Returned-object Builder behavior

Prove:

- returned Template Builder;
- returned Component Builder;
- returned Section Builder;
- returned Group Builder;
- returned Element Builders;
- configure a node after creation;
- configure several siblings later in arbitrary order;
- exact parent object ownership;
- multiple Components belong to the correct Template;
- multiple Sections belong to the correct Component;
- multiple Groups belong to the correct Section;
- Elements belong to the exact owning object.

### Hierarchy/XOR

Prove:

- Template → Component valid;
- Component → Element valid;
- Component → Section valid;
- Component cannot mix Elements and Sections;
- Section → Element valid;
- Section → Group valid;
- Section cannot mix Elements and Groups;
- Group → Element valid;
- Component → Group unavailable/invalid;
- Group → Section unavailable/invalid;
- Group → Group unavailable/invalid;
- Element has no child API.

### Method-name type ownership

Prove typed methods create canonical types without callers passing raw type strings.

### Action Builder

Cover request method, endpoint, authentication, validation flag, binding source, context source, response source where used, literal source where used, response mode, and exact serialized compatibility with the existing action contract.

### Theme Builder

Cover light/dark state where supported, transparent/default status bar, linear gradient, angle, gradient stops, and serialized compatibility.

### Root Screen Builder

Cover required ID/version/target state, exactly one Template, recursive build, canonical validation, schema version, target app, and serialized output.

### Partner screens

Cover Login, OTP, and Dashboard IDs, template IDs/types, hierarchy, bindings/actions, destination compatibility, and Registry retrieval compatibility.

### Registry

Cover draft create/update, publication validation, publish, retrieve, archive/version behavior, rollback if supported, canonical-type redefinition protection, and validation after retrieval.

### Auth/E2E

Preserve tests for Login screen API, Send OTP, OTP screen, Verify OTP, authenticated Dashboard, Registry Dashboard retrieval, 401/403 behavior, and Redis OTP behavior.

Tests, architecture gates, lint, TypeScript strictness, and validation must not be weakened to make migration pass.

## 22. Documentation Ownership

Documentation follows code ownership.

Canonical architecture:

```text
sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md
```

Source reconciliation history:

```text
sdui/PHASE-A-SOURCE-RECONCILIATION.md
```

UI SDK behavior:

```text
sdui/ui-sdk/README.md
```

Registry lifecycle:

```text
sdui/registry/README.md
```

Partner-specific implementation notes, if needed, belong with the correct Partner/API/domain owner.

Do not move Registry-specific truth into unrelated API docs, and do not make Partner docs the source of truth for generic `ui-sdk` contracts.

## 23. Frozen Responsibility Matrix

| Concern | Owner |
|---|---|
| Canonical hierarchy | `ui-sdk` contracts |
| Atomic property vocabulary | `ui-sdk/properties` |
| Definition-specific properties | definition package |
| Reusable node behavior | definition package |
| Reusable typed node Builder | definition package / canonical builder owner |
| Root Screen Builder | `ui-sdk` |
| Hierarchy object graph | `ui-sdk` Builders |
| Typed Theme Builder | `ui-sdk` |
| Typed action/request/body Builder | `ui-sdk`, reusing canonical action contract |
| Screen-specific composition | owning domain/surface Builder |
| Screen-specific values/content | owning domain/surface Builder |
| Final canonical validation | `ui-sdk` validator |
| Serialization | `ui-sdk` serializer |
| Schema compatibility/versioning | `ui-sdk` versioning |
| Draft/publish/archive/retrieve | runtime SDUI Registry |
| HTTP transport | API/surface layer |
| Rendering | frontend SDUI renderer |

## 24. Final Forensic Audit

Before completion, perform a second-pass audit against this document and create a requirement-to-source verification table.

Each requirement must identify:

```text
requirement
source owner
implementation file
test proof
status
```

Allowed status values:

```text
PASS
JUSTIFIED COMPATIBILITY
FAIL
```

There must be no unexplained FAIL.

The audit must explicitly search for:

- raw manually nested production screen JSON;
- `screenSchema.parse({ giant object })` production constructors;
- generic arbitrary property bags for known definitions;
- duplicate Stack property contracts;
- duplicate SDUI engines;
- hidden current-parent state;
- parent-ID composition;
- Registry redefining SDK types;
- screen-specific primitive definitions;
- inconsistent Builder styles across Login/OTP/Dashboard;
- direct raw request action objects in migrated production screen Builders;
- direct raw theme-gradient objects in migrated production screen Builders;
- invalid hierarchy APIs;
- missing XOR enforcement;
- missing final validator layers;
- missing Registry publication validation;
- stale documentation.

## 25. COMPLETE + FROZEN Gate

This document freezes the target architecture, not the current source state.

The SDUI composition campaign may be declared:

```text
SDUI COMPOSITION CAMPAIGN — COMPLETE + FROZEN
```

only when all conditions are true:

1. Source matches this canonical contract.
2. Login uses the canonical returned-object Builder path.
3. OTP uses the same canonical returned-object Builder path.
4. Dashboard uses the same canonical returned-object Builder path.
5. Method-name-defines-type is implemented.
6. Theme Builder is typed.
7. Action/Request/Body Builder is typed.
8. Known definition properties are typed.
9. No production Partner screen giant nested JSON remains.
10. Obsolete raw paths are retired or explicitly justified.
11. Registry owns document lifecycle only; any retained compatibility catalog boundary is documented and cannot redefine canonical SDK types.
12. `ui-sdk` owns reusable definition meaning.
13. Layered validator is authoritative.
14. Tests cover the critical Builder/hierarchy/property/Registry/Auth flows.
15. Documentation matches final source.
16. Full canonical Backend CI is green on the documentation-complete `development` HEAD.
17. Independent Architecture Closeout is green on the **exact same SHA**.
18. Second-pass forensic audit finds no material architectural drift or duplicate ownership.

Only then may the final report provide the exact final SHA, Backend CI run/status, Architecture Closeout run/status, important implementation commits, final documentation paths, test summary, forensic-audit summary, and intentionally retained compatibility boundaries.
