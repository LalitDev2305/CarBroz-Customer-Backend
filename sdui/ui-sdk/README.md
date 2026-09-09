# SDUI UI SDK (`sdui/ui-sdk/`)

`@carbroz/ui-sdk` is the canonical, product-neutral authority for **how CarBroz SDUI is authored, validated, versioned, and serialized**.

Business-specific screens do not define a second SDUI language. Runtime Registry lifecycle is a separate authority.

## Canonical documents

- Architecture and composition contract: [`../SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`](../SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md)
- Generic interaction language: [`ACTION-CONTRACT.md`](./ACTION-CONTRACT.md)

## Ownership

This package owns:

- canonical Screen / Template / Component / Section / Group / Element contracts;
- shared atomic property vocabulary under `src/properties/`;
- reusable definition registries and production definition bootstrap;
- strict definition-specific property contracts;
- typed reusable definition Builders;
- returned-object hierarchy composition;
- the canonical root `SduiScreenBuilder`;
- typed Theme / linear-gradient authoring;
- typed Action / Request / RequestBody authoring over the existing canonical action contract;
- hierarchy, definition, property, invariant, version, target, and publication validation;
- serialization and schema versioning.

This package does **not** own Partner Login, OTP, Dashboard, Booking, or any other business screen composition.

## Frozen hierarchy

Valid shapes are:

```text
Screen → Template → Component → Element
Screen → Template → Component → Section → Element
Screen → Template → Component → Section → Group → Element
```

Mandatory XOR rules:

```text
Component → Elements XOR Sections
Section   → Elements XOR Groups
```

A Template creates Components only. A Group creates Elements only. Elements are terminal.

## Canonical returned-object authoring

New production composition starts with the no-argument root Builder:

```ts
const screen = new SduiScreenBuilder();

screen
  .id('partner_login')
  .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
  .targetApp('PARTNER');
```

Every typed creation method returns the exact child Builder owned by that parent:

```ts
const template = screen.addStackTemplate('login_template');
const form = template.addStackComponent('login_component');
const section = form.addStackSection('mobile_section');
const group = section.addStackGroup('mobile_group');
const mobile = group.addInput('mobile_number');
```

Object reference defines parentage. Configuration order does not.

The same object can be configured immediately or later:

```ts
const brand = template.addStackComponent('brand');
const form = template.addStackComponent('form');

form.vertical().spacing(16);
brand.vertical().spacing(8);
```

Do not implement normal composition through `currentComponent`, `currentSection`, parent-ID lookup, a global composition cursor, or manually managed child arrays.

## Method name defines reusable type

Typed creation methods own the reusable type selection:

```text
addStackTemplate()    → stack_template
addStackComponent()   → stack_component
addStackSection()     → stack_section
addStackGroup()       → stack_group
addText()             → text
addInput()            → input
addButton()           → button
```

Screen code supplies the instance ID; it does not repeatedly pass the raw reusable type string.

## Typed properties

Known definitions expose semantic typed methods such as:

```ts
component
  .vertical()
  .spacing(16)
  .fillMaxWidth();
```

Definition-specific final property contracts remain beside their owning definitions. Shared atomic schemas may be reused, but there is no global final Stack-property contract and no screen-specific duplicate property model.

A generic arbitrary `setProperties({...})` bag is not the normal production authoring API for known definitions.

## Typed Theme Builder

Theme authoring stays inside the SDK:

```ts
const theme = screen.theme();

theme
  .light()
  .statusBarTransparent();

const gradient = theme.linearGradient();

gradient
  .angle(135)
  .addColor('#DDF8F6', 0)
  .addColor('#FFFFFF', 1);
```

The Builder serializes this to the existing canonical `SduiTheme` contract. Production screen composition should not construct a giant nested theme object.

## Typed request/action authoring

The existing `SduiAction` contract remains authoritative. The Builder is only a typed authoring layer over it.

```ts
const request = button.onClickRequest();

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

The RequestBody Builder owns serialized value-reference shapes such as `$binding`, `$context`, `$response`, and `$literal`. Business screen code uses semantic source methods instead of manually constructing those wire objects.

Raw `onClick(SduiAction)` / `withActions(...)` remain compatibility hooks for unmigrated or generic callers; they are not the preferred migrated production screen API when an equivalent typed method exists.

## Final build and validation

`screen.build()` recursively finalizes the Builder graph and passes the canonical Screen through `parseSduiScreen(...)`.

Validation remains defense in depth:

1. structural JSON/schema validation;
2. hierarchy/XOR validation;
3. definition existence;
4. exact definition-specific property validation;
5. semantic/invariant validation;
6. schema version and target-app validation;
7. publication validation through `parseSduiScreenForPublication(...)` where publication semantics apply.

Builder safety never replaces final validation.

## Compatibility boundaries

`BaseSduiScreenBuilder` may still accept the historical constructor configuration and `withTheme(...)` for existing callers while migration converges. `ScreenBuilder` remains a compatibility path for the earlier fully-built-template API.

The authoritative production authoring direction is:

```text
SduiScreenBuilder
→ returned typed child Builders
→ screen.build()
→ canonical layered validation
```

Compatibility hooks must delegate to the same canonical contracts and validation; they must not become parallel engines.

## Registry boundary

`ui-sdk` owns reusable definition meaning. `sdui/registry` owns runtime screen-document draft/version/publish/archive/retrieve lifecycle.

Registry compatibility catalogue APIs are not allowed to redefine canonical production `ui-sdk` types.
