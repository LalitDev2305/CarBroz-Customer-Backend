# CarBroz SDUI Single-Engine Dynamic Composition Architecture

> **Status: FINAL ARCHITECTURE CONTRACT — FROZEN FOR IMPLEMENTATION**
>
> **Implementation rule:** documentation and implementation must remain identical. If code and this document disagree, the implementation is not frozen.

## 1. Canonical owner

`sdui/engine` is the only SDUI language, composition, default/property-resolution, action/reference, validation and screen-composition authority.

Domains own business behavior. API surfaces own HTTP transport/adaptation. `sdui/registry` may own persisted publication/version lifecycle only; it must not become a second SDUI language.

## 2. Canonical hierarchy

Exactly these branches are legal:

```text
Screen -> Template -> Component -> Element
Screen -> Template -> Component -> Section -> Element
Screen -> Template -> Component -> Section -> Group -> Element
```

Rules:

1. Screen owns exactly one Template.
2. Template owns one or more Components.
3. Component owns Elements XOR Sections.
4. Section owns Elements XOR Groups.
5. Group owns Elements only.
6. Element is terminal.
7. Skipped levels are omitted; empty placeholder branches are forbidden.
8. The final validator rejects invalid hierarchy regardless of builder type safety.

## 3. Identity and reusable type

```text
id         = unique concrete node identity within one screen
type       = reusable generic rendering/composition behavior
properties = resolved canonical values for the concrete instance
```

Concrete Template/Component/Section/Group/Element IDs are unique. Reuse is through `type`, properties, actions and composition patterns, never ID reuse.

## 4. Current canonical node vocabulary

The currently registered production NodeDefinitions are exactly:

```text
Templates  : stack_template, form_template, default_template
Component  : stack_component
Section    : stack_section
Group      : stack_group
Elements   : text, image, input, button
```

Normal typed creation methods therefore are:

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

`form_template` is the canonical template for screens whose primary interaction accepts user input and validates/submits data. Partner Login and Partner OTP therefore both use `form_template`.

A horizontal row is currently authored through the real registered `stack_group` type plus an explicit orientation override:

```ts
$.stackGroup('otp_fields_group', $ =>
  $.setOrientation('horizontal')
   .inputElement('otp_code_input', $ => ...)
)
```

There is no `row_group`, `row_component` or `row_section` NodeDefinition in the frozen current vocabulary. A convenience method must never claim a type that is not registered.

Generic extensibility escape hatches remain:

```ts
$.setTemplate(type, id, $ => ...)
$.setComponent(type, id, $ => ...)
$.setSection(type, id, $ => ...)
$.setGroup(type, id, $ => ...)
$.setElement(type, id, $ => ...)
```

## 5. Screen root API

Mandatory Screen identity is constructor-style:

```ts
sdui.screen('partner_login', 'PARTNER', $ => {
  ...
});
```

Frozen signature:

```text
screen(screenId, targetApp, callback)
```

Inside the callback, `$` is the Screen scope.

## 6. Scoped DSL rule

`$` always means the current lexical SDUI scope. The source must visually reveal the hierarchy.

```text
create/select current scope
-> set legal properties directly
-> create legal child
-> child callback ends
-> parent scope continues automatically
```

Long callback receiver names are not the canonical screen-composer style.

## 7. Direct setter API

Screen composers do not navigate through `base()`, `style()`, `content()`, `behavior()` or `metadata()` objects.

Properties are authored directly:

```ts
$.setSpacing(24)
 .setHorizontalAlignment('center')
 .setFillMaxWidth()
 .setPadding({ start: 24, top: 20, end: 24, bottom: 20 });
```

```ts
$.setText('CarBroz')
 .setFontSize(44)
 .setFontWeight(700)
 .setColor('#101522')
 .setTextAlign('center');
```

```ts
$.setBinding('otp')
 .setKeyboardType('number')
 .setValidation(...)
 .setOnClick(...);
```

Autocomplete/type scopes should expose only legal setters for the current node. Final validation remains mandatory.

## 8. Chaining semantics

Frozen behavior:

```text
setter         -> returns current scope
child creation -> executes child callback, returns parent scope
setTheme       -> executes Theme callback, returns Screen scope
```

No `endComponent()`, `endSection()`, `endGroup()` or hidden global/current-parent cursor is allowed.

## 9. Defaults and strict resolution

Each NodeDefinition owns its exact schema, defaults and legal capabilities.

```text
NodeDefinition.defaults
        +
explicit set<Property>() values
        ↓
deterministic merge
        ↓
strict parser/validation
        ↓
canonical serialized properties
```

Rules:

- declared defaults are emitted automatically;
- legal defaults may be overridden per instance;
- non-default properties are omitted unless explicitly set;
- nested plain objects merge deterministically where supported;
- arrays replace as complete values;
- `undefined` means no override;
- one instance never mutates global defaults or another instance;
- unknown/illegal properties are rejected.

## 10. Theme

Every new screen starts from the engine-owned `DEFAULT_SDUI_THEME`. Normal screens do not repeat it.

A genuine screen difference uses a nested Theme scope:

```ts
$.setTheme($ =>
  $.setStatusBar('default')
   .setGradientAngle(90)
);
```

The Theme scope currently exposes legal theme setters such as:

```text
setMode
setShowBackButton
setStatusBar
setGradientType
setGradientAngle
setGradientColors
```

Theme resolution:

```text
DEFAULT_SDUI_THEME
        +
explicit Theme-scope overrides
        ↓
deterministic merge
        ↓
strict theme validation
        ↓
canonical screen.theme
```

Raw object-style `setTheme({...})`, screen-specific ThemeBuilder hierarchies and feature-specific theme wrappers are not part of the frozen composer API.

## 11. Canonical Partner Login authoring shape

```ts
return sdui.screen('partner_login', 'PARTNER', $ =>
  $.formTemplate('tpl_7K2M9Q', $ =>
    $.setSpacing(24)
     .stackComponent('brand_content', $ =>
       $.textElement('brand_name', $ =>
         $.setText('CarBroz')
          .setFontSize(44)
       )
     )
     .stackComponent('login_content', $ =>
       $.stackSection('mobile_field_section', $ =>
         $.stackGroup('mobile_field', $ =>
           $.setOrientation('horizontal')
            .inputElement('mobile_number', $ =>
              $.setBinding('mobileNumber')
               .setKeyboardType('phone')
            )
         )
       )
     )
  )
);
```

## 12. Canonical Partner OTP authoring shape

```ts
return sdui.screen('partner_otp', 'PARTNER', $ =>
  $.formTemplate('tpl_P6X8N3', $ =>
    $.setSpacing(24)
     .stackComponent('otp_content', $ =>
       $.stackSection('otp_field_section', $ =>
         $.stackGroup('otp_fields_group', $ =>
           $.setOrientation('horizontal')
            .inputElement('otp_code_input', $ =>
              $.setMaxLength(6)
               .setKeyboardType('number')
               .setBinding('otp')
            )
         )
       )
     )
  )
);
```

No Login-specific or OTP-specific builder/action language is allowed.

## 13. Generic actions and references

Frozen actions:

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

Authoring uses `action.*` and `ref.*`. Request-dependent navigation uses `request` with `responseMode = destination`; it is not modeled as independent `request + navigate`.

## 14. Destination identity

Canonical Destination:

```text
screenId
templateId
templateType
endpoint
method
authentication
```

Loaded identity:

```text
screen.screenId
screen.schemaVersion
screen.targetApp
screen.template.id
screen.template.type
```

After fetch, destination screen/template identity must equal the loaded document identity.

## 15. Partner Auth frozen identities

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

Dashboard Destination:

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

Production OTP persistence remains Redis-only.

## 16. Registration and orchestration

Every product screen implements `ScreenComposer`, lives under `sdui/engine/src/screens/<app>/`, and is registered once in `ScreenRegistry` by `(targetApp, screenId)`.

Canonical runtime flow:

```text
(targetApp, screenId, context)
-> ScreenRegistry
-> ScreenComposer
-> SduiBuilder + default resolution
-> SduiValidator
-> canonical SduiScreen
```

API surfaces request and serialize screens; they do not build trees.

## 17. Required proof

Focused implementation must prove:

- exact Screen identity from `screen(screenId, targetApp, ...)`;
- all three legal hierarchy branches and XOR rejection;
- type-specific creation serializes the registered canonical type;
- generic escape hatches work for registered definitions;
- setters affect only the current instance and return the current scope;
- child callbacks return the parent scope;
- default/theme isolation;
- scoped Theme override behavior;
- Login and OTP both use `form_template` as input/submission screens;
- Login and OTP canonical output/behavior parity;
- generic action/reference parity;
- API/auth behavior unchanged;
- Redis-only OTP persistence unchanged;
- focused validation for the affected change, with broader gates reserved for freeze/release or actual cross-module impact.

## 18. Permanent anti-patterns

Forbidden:

```text
object-wrapped mandatory Screen identity in normal authoring
base()/style()/content()/behavior() navigation in screen composers
raw object-style setTheme({...})
hidden mutable parent cursor
endComponent/endSection/endGroup navigation
screen-specific builder types
feature-specific action types
unregistered type-specific convenience methods
giant unrestricted property bag
SDUI tree construction in domains/API surfaces
second validator or node-definition registry
silent property dropping
```

## 19. Final frozen statement

> **CarBroz SDUI uses one canonical hierarchy and one scoped internal Builder DSL. Screen identity is authored as `sdui.screen(screenId, targetApp, $ => ...)`. The current registered vocabulary is stack/form/default templates, stack component/section/group, and text/image/input/button elements. Screens whose primary interaction accepts and submits user input use `form_template`; Partner Login and Partner OTP both follow that rule. `$` is always the current lexical scope. Properties are direct `set<Property>()` calls. Horizontal rows use the registered `stack_group` with `setOrientation('horizontal')`; no unregistered row type is implied. Theme starts from `DEFAULT_SDUI_THEME` and genuine differences use `setTheme($ => ...)`. Setters return current scope, child creation returns parent scope, and canonical NodeDefinitions plus the final validator remain authoritative.**