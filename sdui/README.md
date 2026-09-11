# CarBroz SDUI Documentation Authority Map

> **Status:** ACTIVE — read this before changing SDUI code.

This file defines the current SDUI implementation authorities and the active frozen rules that must govern implementation.

## 1. Current read order

For implementation, use this order:

```text
1. sdui/README.md
2. sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md
3. sdui/PARTNER-AUTH-SDUI-CONTRACT.md
4. docs/PARTNER-AUTH-SDUI-MVI-UDF-HANDOFF.md
5. docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md
6. docs/MASTER-BACKEND-CONSTITUTION.md
7. executable architecture / freeze gates
```

The Master Backend Constitution and the frozen SDUI implementation plan must remain consistent with the same physical topology and ownership model: `sdui/engine` is the canonical SDUI language/composition/validation owner and `sdui/registry` is limited to persisted lifecycle/version responsibilities that still have concrete runtime/admin consumers.

## 2. Permanent SDUI authority

`sdui/engine` is the sole SDUI language, composition, definition, validation and screen-composition authority.

It owns:

- `Screen`, `Template`, `Component`, `Section`, `Group`, `Element` contracts;
- the scoped fluent `SduiBuilder` DSL;
- `action.*` and `ref.*` authoring;
- canonical node defaults and property resolution;
- node definitions and `NodeDefinitionRegistry`;
- `ScreenRegistry` and explicit screen registration;
- `SduiValidator`;
- `SduiService`;
- serialization/model contracts;
- Partner/Customer/Admin screen composers under `sdui/engine/src/screens/*`.

No API surface or domain may maintain a parallel screen-composition language.

## 3. Canonical hierarchy

The legal hierarchy is:

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

Frozen structural rules:

```text
Screen owns exactly one Template.
Template owns one or more Components.
Component owns Elements XOR Sections.
Section owns Elements XOR Groups.
Group owns Elements only.
Element is terminal.
```

Template and Component are mandatory. Section and Group are optional only according to the legal branch above.

## 4. Frozen screen-root API

Mandatory screen identity is supplied directly to `sdui.screen`:

```ts
sdui.screen('partner_login', 'PARTNER', $ => {
  ...
});
```

Frozen rule:

```text
screen(screenId, targetApp, callback)
```

`screenId` and `targetApp` are mandatory root identity values, so normal screen composers do not wrap them in an object merely to create the Screen.

Inside the callback, `$` is the current Screen scope.

## 5. Frozen scoped authoring DSL

The authoring API mirrors the hierarchy directly.

Type-specific creation methods encode reusable type and accept only the concrete ID plus child callback:

```ts
$.stackTemplate('tpl_7K2M9Q', $ => { ... });
$.formTemplate('tpl_P6X8N3', $ => { ... });

$.stackComponent('login_content', $ => { ... });
$.stackSection('action_section', $ => { ... });
$.rowGroup('field_group', $ => { ... });

$.textElement('title', $ => { ... });
$.imageElement('logo', $ => { ... });
$.inputElement('mobile_number', $ => { ... });
$.buttonElement('continue_button', $ => { ... });
```

`$` always means the current node in that lexical scope.

The normal screen-composer style does not repeat `screen`, `template`, `component`, `section`, `group` or `element` callback variable names.

The hierarchy itself must be visible from nested creation methods.

## 6. Frozen direct setter rule

Properties are configured directly on the current node through legal `set<Property>()` methods.

Examples:

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
$.setLeading(...)
 .setTrailing(...)
 .setBinding('otp')
 .setEnabled(false)
 .setOnClick(action.request(...));
```

Screen composers do not navigate through separate property-category objects. The developer-facing model is:

```text
current node
→ set<Property>()
→ create legal child
```

Node definitions still own exact schemas, defaults and legal capabilities internally.

## 7. Chaining and scope-return semantics

Frozen behavior:

```text
setter → returns current scope
child creation → executes nested callback, then returns parent scope
```

This allows:

```ts
$.setSpacing(18)
 .setFillMaxWidth()
 .stackSection('field_section', $ =>
   $.rowGroup('field_group', $ =>
     $.inputElement('otp_code_input', $ =>
       $.setBinding('otp')
        .setKeyboardType('number')
     )
   )
 )
 .stackSection('action_section', $ =>
   $.buttonElement('verify_button', $ =>
     $.setText('Verify & Continue')
   )
 );
```

No `endComponent()`, `endSection()`, `endGroup()` or global current-parent cursor is allowed.

## 8. Generic creation escape hatches

For extensibility the builder may expose generic methods where required:

```ts
$.setTemplate(type, id, $ => { ... });
$.setComponent(type, id, $ => { ... });
$.setSection(type, id, $ => { ... });
$.setGroup(type, id, $ => { ... });
$.setElement(type, id, $ => { ... });
```

Normal screen composition should prefer readable type-specific methods.

There is one builder architecture only.

## 9. Generic action/reference contract

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

Authoring:

```ts
action.request(...)
action.navigate(...)
action.present(...)
action.dismiss(...)
action.state(...)
action.externalUri(...)
action.sequence(...)

ref.binding(...)
ref.context(...)
ref.response(...)
ref.literal(...)
```

Events are set on the current Element with setters such as:

```ts
$.setOnClick(...)
$.setOnLongClick(...)
```

Request-dependent navigation uses `request` with `responseMode = destination`.

## 10. Partner Login / OTP authority

`PARTNER-AUTH-SDUI-CONTRACT.md` freezes the external Partner auth flow:

```text
Bootstrap → Login → Send OTP → OTP → Verify OTP → Dashboard
```

Concrete composers:

```text
sdui/engine/src/screens/partner/PartnerLoginScreen.ts
sdui/engine/src/screens/partner/PartnerOtpScreen.ts
```

Frozen template identities:

```text
Partner Login = tpl_7K2M9Q / stack_template
Partner OTP   = tpl_P6X8N3 / form_template
```

API Partner routes/controllers are transport adapters only. Identity owns authentication and OTP business behavior. SDUI owns presentation composition.

## 11. OTP/security authority

`../docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md` governs OTP security/persistence together with the backend constitutions.

Production OTP persistence is Redis-backed only. One-time consume behavior, attempt limits, expiry, ordering and safe error behavior remain tested.

## 12. Configuration boundary

Configuration owns startup routing/configuration decisions, not screen structure.

For Partner bootstrap:

```text
guest → Partner Login destination
authenticated → Partner Dashboard destination
```

The Destination identifies the next resource. The actual screen document remains engine-owned.

## 13. Canonical property/default model

Every reusable NodeDefinition owns:

```text
canonical type
hierarchy level
legal child/content mode
exact property schema
canonical defaults
legal setter capabilities
supported events where applicable
```

Frozen resolution pipeline:

```text
NodeDefinition.defaults
        +
explicit set<Property>() values
        ↓
deterministic merge
        ↓
strict property validation
        ↓
canonical serialized properties
```

Frozen semantics:

1. Every value present in `NodeDefinition.defaults` is emitted even when the screen composer does not mention it.
2. A screen may override any legal default for that node instance.
3. A legal non-default property is omitted unless explicitly supplied.
4. One screen/node override never mutates another node or definition defaults.
5. Nested plain objects merge recursively where supported.
6. Arrays replace as complete values.
7. `undefined` means no override.
8. The fully resolved property object is strictly validated.
9. Unknown/illegal properties are rejected.
10. Golden tests prove default emission, override, isolation, omission and deterministic merge semantics.

Current canonical defaults are defined by the current engine NodeDefinitions. Screen code must not infer defaults from visual examples.

## 14. Frozen screen-theme rule

`theme` is screen-level typed configuration and the SDUI engine owns one canonical `DEFAULT_SDUI_THEME`.

Normal screens do not mention theme at all:

```ts
return sdui.screen('partner_login', 'PARTNER', $ =>
  $.stackTemplate('tpl_7K2M9Q', $ => {
    ...
  })
);
```

When one screen genuinely differs from the default, it opens a Theme scope and sets only the changed values:

```ts
$.setTheme($ =>
  $.setStatusBar('default')
   .setGradientAngle(90)
);
```

The nested `$` inside `setTheme` means the current Theme scope. Theme scope exposes only legal theme setters, such as:

```text
setMode(...)
setStatusBar(...)
setGradientType(...)
setGradientAngle(...)
setGradientColors(...)
```

A Theme scope must not expose unrelated element/layout setters.

Frozen theme resolution:

```text
DEFAULT_SDUI_THEME
        +
explicit values authored in setTheme($ => ...)
        ↓
deterministic merge
        ↓
strict theme validation
        ↓
canonical screen.theme
```

One screen theme override never mutates `DEFAULT_SDUI_THEME` or another screen. No Login theme, OTP theme, Partner Auth theme, ThemeBuilder hierarchy or raw object-style theme authoring is part of the frozen screen-composer API.

## 15. Change rule

For an SDUI change:

```text
current governing contract
→ architecture/ownership check
→ implementation at the existing owner
→ focused positive + negative tests
→ wire/behavior parity proof where applicable
→ canonical architecture gates
→ exact-SHA verification
```

Do not add compatibility wrappers, aliases, secondary registries, secondary validators, duplicate screen composers or duplicate property systems.

## 16. Current focused freeze

Current focused scope:

```text
Configuration
Partner Login
Partner OTP
SDUI architecture/design
```

Within this scope the target is:

- one `sdui/engine` language/composition/validation authority;
- engine-owned Partner Login and OTP composers;
- API transport-only screen delivery;
- Identity-owned Login/OTP business behavior;
- Redis-backed production OTP challenge persistence;
- Configuration-owned bootstrap/startup decision data;
- one scoped setter DSL across Login and OTP;
- canonical JSON and action/reference behavior unchanged;
- focused tests and documentation aligned with the exact implementation;
- no unrelated backend feature expansion.

## 17. Documentation governance

A frozen decision becomes implementation authority only when it is written into the active governing repository documentation.

Rules:

1. Update the highest relevant active authority before or with implementation.
2. Active documents must not contradict one another.
3. The read order above must always point to the current implementation direction.
4. Important frozen semantics require executable regression/golden tests where practical.
5. A freeze is complete only after the final documentation + implementation candidate is validated on the same exact commit SHA.

## 18. Frozen authoring statement

> **CarBroz SDUI screen source must read like the canonical tree. Screen creation uses `sdui.screen(screenId, targetApp, $ => ...)`, with mandatory identity supplied directly once. A developer then adds its typed Template, typed Component, optional typed Section, optional typed Group and terminal Element nodes. Creation method names encode reusable type; the concrete ID is supplied once. Every nested callback uses `$` as the current-scope receiver. Node properties are configured directly through legal `set<Property>()` methods. Theme uses the same scoped rule through `setTheme($ => ...)`, where the nested Theme scope exposes only theme setters and overrides only values that differ from `DEFAULT_SDUI_THEME`. Setters return the current scope, while child creation returns the parent scope after the nested callback. The engine preserves one canonical JSON contract, one validator authority and one NodeDefinition/default system.**
