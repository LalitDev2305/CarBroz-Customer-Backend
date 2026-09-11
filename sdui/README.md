# CarBroz SDUI Documentation Authority Map

> **Status:** ACTIVE — read this before changing SDUI code.

## 1. Current read order

```text
1. sdui/README.md
2. sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md
3. sdui/PARTNER-AUTH-SDUI-CONTRACT.md
4. docs/PARTNER-AUTH-SDUI-MVI-UDF-HANDOFF.md
5. docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md
6. docs/MASTER-BACKEND-CONSTITUTION.md
7. executable architecture / freeze gates
```

Active documents must not contradict one another. Current repository definitions and frozen contracts are authoritative; no obsolete authoring syntax is implementation guidance.

## 2. Permanent owner

`sdui/engine` is the sole SDUI language, composition, NodeDefinition/default, action/reference, validation and screen-composition authority.

It owns:

```text
Screen / Template / Component / Section / Group / Element
SduiBuilder
NodeDefinitionRegistry
ScreenRegistry
SduiValidator
SduiService
action.* / ref.*
screen composers
canonical serialization
```

`apps/api` is transport-only for screen delivery. Business domains do not build SDUI trees. `sdui/registry` is restricted to persisted lifecycle/version responsibilities.

## 3. Canonical hierarchy

```text
Screen -> Template -> Component -> Element
Screen -> Template -> Component -> Section -> Element
Screen -> Template -> Component -> Section -> Group -> Element
```

Rules:

```text
Screen owns exactly one Template.
Template owns one or more Components.
Component owns Elements XOR Sections.
Section owns Elements XOR Groups.
Group owns Elements only.
Element is terminal.
```

## 4. Current registered node vocabulary

The current production registry contains exactly:

```text
Templates : stack_template, form_template, default_template
Component : stack_component
Section   : stack_section
Group     : stack_group
Elements  : text, image, input, button
```

Therefore normal typed creation methods are exactly:

```ts
$.stackTemplate(id, $ => ...)
$.formTemplate(id, $ => ...)
$.defaultTemplate(id, $ => ...)
$.stackComponent(id, $ => ...)
$.stackSection(id, $ => ...)
$.stackGroup(id, $ => ...)
$.textElement(id, $ => ...)
$.imageElement(id, $ => ...)
$.inputElement(id, $ => ...)
$.buttonElement(id, $ => ...)
```

A horizontal row is represented by the real `stack_group` definition plus orientation:

```ts
$.stackGroup('otp_fields_group', $ =>
  $.setOrientation('horizontal')
   .inputElement('otp_code_input', $ => ...)
)
```

No unregistered `row_group`, `row_component`, `row_section`, icon element, divider element or spacer element is implied by the current frozen DSL. Leading/trailing icon/divider data remains property/accessory data where supported.

## 5. Screen root

Frozen authoring for an input/submission screen:

```ts
return sdui.screen('partner_login', 'PARTNER', $ =>
  $.formTemplate('tpl_7K2M9Q', $ => {
    ...
  })
);
```

Signature:

```text
screen(screenId, targetApp, callback)
```

Mandatory Screen identity is supplied once, directly.

## 6. Scoped authoring DSL

`$` always means the current lexical scope: Screen, Theme, Template, Component, Section, Group or Element.

Developer mental model:

```text
current scope
-> set legal properties directly
-> create legal child
-> child callback completes
-> parent scope continues
```

Setters return the current scope. Child creation returns the parent scope. No hidden mutable parent cursor and no `end*()` navigation API is allowed.

## 7. Direct setter rule

Screen composers use direct setters:

```ts
$.setSpacing(...)
 .setPadding(...)
 .setText(...)
 .setLeading(...)
 .setTrailing(...)
 .setBinding(...)
 .setEnabled(...)
 .setOnClick(...);
```

Developer-facing `base()`, `style()`, `content()`, `behavior()` and `metadata()` navigation is not part of the frozen composer API.

NodeDefinitions remain the authority for exact schemas, defaults and legal capabilities.

## 8. Generic creation escape hatches

```ts
$.setTemplate(type, id, $ => ...)
$.setComponent(type, id, $ => ...)
$.setSection(type, id, $ => ...)
$.setGroup(type, id, $ => ...)
$.setElement(type, id, $ => ...)
```

They exist for registered definitions and extensibility. Normal screen composition prefers current typed methods.

## 9. Template usage rule

`form_template` is the canonical template for screens whose primary interaction includes user input that is validated/submitted to send data, such as Login and OTP.

`stack_template` remains available for non-form screens where the primary purpose is layout/content composition rather than form submission.

This is a semantic screen-level choice; Elements and hierarchy rules remain unchanged.

## 10. Theme

Every screen starts from `DEFAULT_SDUI_THEME`. Normal screens do not repeat it.

A genuine difference uses a Theme scope:

```ts
$.setTheme($ =>
  $.setStatusBar('default')
   .setGradientAngle(90)
);
```

Theme scope is typed and only exposes legal theme setters. Explicit overrides merge into the default and the complete result is strictly validated. Raw object-style `setTheme({...})` is not part of the frozen composer API.

## 11. Defaults/property resolution

```text
NodeDefinition.defaults
        +
explicit set<Property>() values
        ↓
deterministic merge
        ↓
strict node parser/validation
        ↓
canonical serialized properties
```

Defaults are isolated, arrays replace as complete values, `undefined` means no override, and unknown properties are rejected.

## 12. Generic actions/references

Actions:

```text
request
navigate
present
dismiss
state
external_uri
sequence
```

References:

```text
$binding
$context
$response
$literal
```

Authoring uses `action.*` and `ref.*`. Request-dependent navigation uses `request` with `responseMode = destination`.

## 13. Partner Login / OTP freeze

Login:

```text
screenId      = partner_login
template.id   = tpl_7K2M9Q
template.type = form_template
targetApp     = PARTNER
GET /api/v1/partner/screen/auth_login
```

OTP:

```text
screenId      = partner_otp
template.id   = tpl_P6X8N3
template.type = form_template
targetApp     = PARTNER
GET /api/v1/partner/screen/auth_otp
```

Concrete owners:

```text
sdui/engine/src/screens/partner/PartnerLoginScreen.ts
sdui/engine/src/screens/partner/PartnerOtpScreen.ts
```

Identity owns Login/OTP business behavior. Production OTP persistence is Redis-backed only. Configuration owns bootstrap/startup routing decisions.

## 14. Change rule

```text
current governing contract
-> inspect current implementation/definitions
-> change the canonical owner only
-> focused positive + negative tests
-> wire/behavior parity proof
-> architecture/build/lint/test gates when the change requires them
-> exact-SHA verification for a freeze/release candidate
```

Do not add compatibility wrappers, aliases, secondary builders, secondary validators or duplicate screen owners.

## 15. Current focused freeze

The active focused scope is:

```text
Configuration
Partner Login
Partner OTP
SDUI builder/composition architecture
```

Unrelated module coverage debt or feature work is outside this freeze.

## 16. Frozen authoring statement

> **CarBroz SDUI screen source reads like the canonical tree. Screen creation is `sdui.screen(screenId, targetApp, $ => ...)`. The current typed vocabulary exactly mirrors registered NodeDefinitions: stack/form/default Template, stack Component/Section/Group, and text/image/input/button Elements. `$` is the current lexical scope. Properties are direct `set<Property>()` calls. Screens whose primary interaction is input validation/submission use `form_template`; Partner Login and Partner OTP therefore both use `form_template`. Horizontal layout uses `stackGroup(...).setOrientation('horizontal')`. Theme uses `setTheme($ => ...)` only for differences from `DEFAULT_SDUI_THEME`. Setters return current scope; child creation returns parent scope. One canonical JSON contract, validator and NodeDefinition/default system remain authoritative.**
