# CarBroz SDUI Single-Engine Dynamic Composition Architecture

> **Status: FINAL ARCHITECTURE CONTRACT — FROZEN FOR IMPLEMENTATION**
>
> **Implementation rule:** documentation is updated first. Source code must then converge to this contract exactly. If implementation and this document disagree, implementation is wrong until this document is deliberately amended and re-frozen.

---

## 1. Purpose

CarBroz uses Server-Driven UI (SDUI) so the backend can describe screens dynamically while Android, iOS and Desktop render one stable canonical JSON contract.

The architecture must remain:

- simple to read and write;
- strongly typed;
- safe at runtime;
- explicit about hierarchy;
- extensible without changing unrelated screens;
- reusable across Partner, Customer and Admin applications;
- independent from business-domain ownership;
- free from duplicate builders, validators and registries;
- suitable for long-term evolution.

Permanent ownership rule:

> **One SDUI engine owns vocabulary, composition, property resolution, action authoring, screen resolution, validation and canonical output.**

Domains own business behavior. SDUI owns presentation. API surfaces own HTTP transport/adaptation only.

---

## 2. Canonical engine ownership

Canonical module:

```text
sdui/engine
```

The engine owns:

```text
Screen / Template / Component / Section / Group / Element model
SduiBuilder
NodeDefinitionRegistry
ScreenRegistry
SduiValidator
SduiService
action.* helpers
ref.* helpers
screen composers
canonical defaults
canonical serialization
```

No API surface or domain may become a second screen-composition owner.

---

## 3. Canonical hierarchy — frozen

The legal hierarchy is exactly:

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

The authoring API must make illegal combinations difficult or impossible and the final validator must reject every illegal document regardless of how it was produced.

---

## 4. Identity and reusable type semantics

Every node follows:

```text
id         = unique concrete instance identity within the screen
type       = reusable generic rendering/composition behavior
properties = resolved canonical values for that instance
children   = owned structural descendants where legal
```

Examples:

```text
id   = login_content
type = stack_component

id   = mobile_number
type = input
```

Concrete Template, Component, Section, Group and Element IDs are unique. Reuse is expressed through generic `type`, properties, actions and composition patterns, never by reusing concrete IDs.

---

## 5. Frozen authoring philosophy

The developer-facing DSL is intentionally simple:

```text
create node
→ set properties directly on the current node
→ create legal children
→ child scope ends
→ parent scope continues automatically
```

The code itself must visually reveal the JSON hierarchy.

There is one current-node receiver inside every nested callback:

```ts
$
```

`$` always means **the current SDUI node for that lexical scope**.

The same convention is used for Template, Component, Section, Group and Element callbacks. Long callback names such as `template =>`, `component =>`, `section =>` and `element =>` are not part of the frozen authoring style.

---

## 6. Type-specific creation methods — frozen

Creation method names encode the reusable node type while the argument provides the concrete node ID.

Examples:

```text
formTemplate('tpl_P6X8N3', ...)
stackTemplate('tpl_7K2M9Q', ...)

stackComponent('otp_content', ...)
rowComponent('some_row', ...)

stackSection('otp_action_section', ...)
rowSection('some_section', ...)

stackGroup('otp_fields_group', ...)
rowGroup('some_group', ...)

textElement('title', ...)
imageElement('logo', ...)
inputElement('otp_code_input', ...)
buttonElement('verify_button', ...)
iconElement('edit_icon', ...)
dividerElement('divider', ...)
spacerElement('space', ...)
```

The type is implied by the creation method:

```text
formTemplate(...)      → type = form_template
stackTemplate(...)     → type = stack_template
stackComponent(...)    → type = stack_component
stackSection(...)      → type = stack_section
stackGroup(...)        → type = stack_group
textElement(...)       → type = text
inputElement(...)      → type = input
buttonElement(...)     → type = button
```

Identity and type are therefore not passed redundantly by normal screen composers.

---

## 7. Generic creation escape hatches

The engine must remain extensible even when a convenience method does not yet exist.

Legal generic fallbacks may exist:

```ts
$.setTemplate(type, id, $ => { ... });
$.setComponent(type, id, $ => { ... });
$.setSection(type, id, $ => { ... });
$.setGroup(type, id, $ => { ... });
$.setElement(type, id, $ => { ... });
```

Normal screen composition should prefer type-specific methods because they are faster to read and harder to misuse.

Adding a new reusable node type must not require a second builder architecture.

---

## 8. Direct setter property API — frozen

A node exposes legal properties directly through `set<Property>()` methods.

Examples:

```ts
$.setSpacing(24)
 .setHorizontalAlignment('center')
 .setFillMaxSize()
 .setPadding({
   start: 24,
   top: 20,
   end: 24,
   bottom: 20,
 });
```

Element examples:

```ts
$.setText('CarBroz')
 .setFontSize(44)
 .setFontWeight(700)
 .setColor('#101522')
 .setTextAlign('center');
```

```ts
$.setUrl('/images/carbroz_logo.png')
 .setWidth(120)
 .setHeight(96);
```

```ts
$.setBinding('otp')
 .setKeyboardType('number')
 .setMaxLength(6)
 .setValidation({
   required: true,
   pattern: '^[0-9]{6}$',
   message: 'Enter the 6-digit OTP',
 });
```

Event and embedded-content properties follow the same rule:

```ts
$.setLeading(...)
 .setTrailing(...)
 .setEnabled(false)
 .setOnClick(action.request(...));
```

The screen composer must not require category navigation to set a property. The authoring surface is the current node plus legal `set...()` methods.

---

## 9. Property ownership and validation

Internally, node definitions may still classify properties by concern for schema organization, validation and implementation reuse, but those classifications are not separate developer-facing authoring scopes.

Every reusable node definition owns:

- canonical `type`;
- hierarchy level;
- legal children/content mode;
- exact property schema;
- canonical defaults;
- legal setter capabilities;
- supported events where applicable.

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

Autocomplete should expose only legal setters for the current scope. Invalid node/property combinations must fail at compile time where practical and always fail final validation.

Examples that must not be legal:

```ts
// image nodes do not expose text typography setters
// text nodes do not expose input keyboard setters
```

The system must not expose one unrestricted giant property bag to every node.

---

## 10. Canonical defaults and overrides

The screen composer should not repeat canonical defaults.

Resolution pipeline:

```text
NodeDefinition.defaults
        +
explicit set<Property>() overrides/additions
        ↓
deterministic merge
        ↓
strict node property validation
        ↓
canonical serialized properties
```

Frozen semantics:

1. Values declared in `NodeDefinition.defaults` are emitted automatically.
2. A screen may override an allowed default for that node instance.
3. A legal non-default property appears only when explicitly set.
4. Unknown properties are rejected.
5. One node override never mutates another node or global defaults.
6. Nested plain-object overrides merge deterministically where supported.
7. Arrays replace as complete values.
8. `undefined` means no override.
9. Final resolved properties are validated after resolution.

Example screen authoring:

```ts
$.setSpacing(14)
 .setPadding({ start: 24, end: 24 });
```

The serialized JSON may still contain all canonical defaults after resolution.

---

## 11. Theme — screen-level setter rule

Theme is screen-level typed configuration, not structural hierarchy.

The engine owns one canonical default screen theme. New screens do not repeat that default.

When a screen genuinely differs it may set only the override:

```ts
$.setTheme({
  statusBar: 'default',
  properties: {
    gradient: { angle: 90 },
  },
});
```

Resolution remains:

```text
DEFAULT_SDUI_THEME
        +
optional screen setTheme override
        ↓
deterministic merge
        ↓
strict theme validation
        ↓
canonical screen.theme
```

No screen-specific theme framework is required.

---

## 12. Frozen scoped DSL shape

The canonical authoring shape is:

```ts
return sdui.screen(
  {
    id: 'partner_otp',
    targetApp: 'PARTNER',
  },
  $ =>
    $.formTemplate('tpl_P6X8N3', $ =>
      $.setSpacing(24)
       .setHorizontalAlignment('center')
       .setFillMaxSize()
       .setPadding({ start: 24, top: 20, end: 24, bottom: 20 })
       .stackComponent('otp_content', $ =>
         $.setSpacing(18)
          .setHorizontalAlignment('center')
          .setFillMaxWidth()
          .stackSection('otp_field_section', $ =>
            $.setFillMaxWidth()
             .rowGroup('otp_fields_group', $ =>
               $.setHorizontalAlignment('center')
                .inputElement('otp_code_input', $ =>
                  $.setMaxLength(6)
                   .setKeyboardType('number')
                   .setBinding('otp')
                )
             )
          )
       )
    ),
);
```

Key rules:

- nested callbacks define hierarchy boundaries;
- `$` always refers to the current node;
- property methods return the current scope for chaining;
- child-creation methods return the current parent scope after the child callback completes;
- no `.endComponent()`, `.endSection()`, `.endGroup()` or similar navigation methods;
- no global mutable current-parent cursor;
- lexical nesting is the source of hierarchy truth.

---

## 13. Screen root authoring

`SduiBuilder.screen()` creates the screen root from mandatory identity data and applies the canonical theme automatically.

Canonical shape:

```ts
sdui.screen(
  {
    id: 'partner_login',
    targetApp: 'PARTNER',
  },
  $ => {
    $.stackTemplate('tpl_7K2M9Q', $ => {
      // template properties and components
    });
  },
);
```

A screen-level property is set on the screen scope:

```ts
$.setTheme(...);
```

The screen callback does not require a variable named `screen`.

---

## 14. Canonical Login authoring target

Partner Login is the first golden-reference screen for this DSL.

Conceptual target:

```ts
return sdui.screen(
  {
    id: 'partner_login',
    targetApp: 'PARTNER',
  },
  $ =>
    $.stackTemplate('tpl_7K2M9Q', $ =>
      $.setSpacing(24)
       .setPadding({ start: 24, end: 24 })
       .stackComponent('brand_content', $ =>
         $.setSpacing(6)
          .setHorizontalAlignment('center')
          .imageElement('brand_logo', $ =>
            $.setUrl('/images/carbroz_logo.png')
             .setWidth(120)
             .setHeight(96)
          )
          .textElement('brand_name', $ =>
            $.setText('CarBroz')
             .setFontSize(44)
             .setFontWeight(700)
             .setTextAlign('center')
          )
       )
       .stackComponent('login_content', $ =>
         $.setSpacing(14)
          .stackSection('mobile_field_section', $ =>
            $.stackGroup('mobile_field', $ =>
              $.inputElement('mobile_number', $ =>
                $.setPlaceholder('98765 43210')
                 .setBinding('mobileNumber')
                 .setKeyboardType('phone')
              )
            )
          )
          .stackSection('action_section', $ =>
            $.buttonElement('continue_button', $ =>
              $.setText('Continue')
               .setOnClick(
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
               )
            )
          )
       )
    ),
);
```

The wire output must remain compatible with the frozen Partner Login contract.

---

## 15. Canonical OTP authoring target

Partner OTP uses exactly the same hierarchy and setter language as Login.

Conceptual structure:

```text
Screen partner_otp
└── formTemplate tpl_P6X8N3
    ├── stackComponent otp_brand_content
    │   ├── imageElement otp_brand_logo
    │   ├── textElement otp_brand_name
    │   ├── textElement otp_partner_label
    │   ├── textElement otp_brand_tagline
    │   ├── textElement otp_screen_title
    │   ├── textElement otp_screen_subtitle
    │   └── textElement otp_phone_number
    └── stackComponent otp_content
        ├── stackSection otp_field_section
        │   └── stackGroup/rowGroup otp_fields_group
        │       └── inputElement otp_code_input
        └── stackSection otp_action_section
            ├── textElement otp_resend_text
            ├── buttonElement otp_verify_button
            └── textElement otp_legal_text
```

No OTP-specific builder is permitted.

---

## 16. Leading, trailing and rich element properties

Leading/trailing content is authored as a normal property on the owning Element:

```ts
$.setText('PARTNER')
 .setLeading({
   type: 'divider',
   properties: {
     orientation: 'horizontal',
     width: 36,
     thickness: 2,
     color: '#13B8B5',
   },
 })
 .setTrailing({
   type: 'divider',
   properties: {
     orientation: 'horizontal',
     width: 36,
     thickness: 2,
     color: '#13B8B5',
   },
 });
```

Rich text remains generic:

```ts
$.setSpans([
  { text: 'Verify ' },
  { text: 'Your', color: '#13B8B5' },
  { text: ' Number' },
]);
```

Inline actions are generic actions and do not create screen-specific primitives.

---

## 17. Generic action/reference vocabulary

Frozen generic actions:

```text
request
navigate
present
dismiss
state
external_uri
sequence
```

Authoring namespace:

```ts
action.request(...)
action.navigate(...)
action.present(...)
action.dismiss(...)
action.state(...)
action.externalUri(...)
action.sequence(...)
```

References:

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

Events are set directly on Elements:

```ts
$.setOnClick(action.request(...));
$.setOnLongClick(action.present(...));
```

No feature-specific action type is allowed.

---

## 18. Request-dependent navigation

When navigation depends on a request succeeding:

```text
request + responseMode = destination
```

must be used.

Do not model dependent navigation as independent request + navigate steps.

Execution order:

```text
validate applicable inputs
→ resolve references
→ request
→ failure: expose/reduce error, no navigation
→ success: retain required transient response/context
→ validate destination
→ satisfy authentication requirement
→ fetch destination
→ verify loaded-screen identity
→ navigate/render
```

---

## 19. Destination and loaded-screen identity

Canonical Destination:

```text
screenId
templateId
templateType
endpoint
method
authentication
```

Loaded screen identity:

```text
screen.screenId
screen.schemaVersion
screen.targetApp
screen.template.id
screen.template.type
```

After fetch:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

The client must not infer routes from screen/template IDs.

---

## 20. ScreenComposer contract

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
- no repository/service locator in `ScreenContext`;
- no direct database, Redis or provider access;
- no domain business-policy ownership;
- no screen inheritance.

---

## 21. Registration

Adding a screen requires:

```text
1. create the ScreenComposer
2. register it once
3. done
```

Example:

```ts
export const partnerScreens = [
  new PartnerLoginScreen(),
  new PartnerOtpScreen(),
  new PartnerDashboardScreen(),
];
```

`ScreenRegistry` key:

```text
(targetApp, screenId)
```

The registry rejects duplicates and unknown screens.

Every reusable node definition is likewise registered once in `NodeDefinitionRegistry`.

---

## 22. SduiService orchestration

Canonical flow:

```text
(targetApp, screenId, context)
      ↓
ScreenRegistry
      ↓
ScreenComposer
      ↓
SduiBuilder + default/property resolution
      ↓
SduiValidator
      ↓
canonical SduiScreen
```

API surfaces request a screen from the service and serialize it. They do not construct SDUI trees.

---

## 23. Validation — defense in depth

Builder type safety never replaces final validation.

Required validation stages:

1. root structural validation;
2. hierarchy/XOR validation;
3. node definition existence;
4. exact property validation after defaults/overrides resolve;
5. event/action compatibility validation;
6. semantic/invariant validation;
7. schema-version validation;
8. target-app validation;
9. publication validation where persisted lifecycle semantics apply.

Invalid values are never repaired, silently dropped or coerced into unrelated meaning.

Stable error categories include:

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

## 24. Partner Auth identities — frozen

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
templateId     = tpl_P6X8N3
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

### Verify OTP

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Body:

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

Production OTP persistence remains Redis-only.

---

## 25. Implementation sequence

Implementation begins only after the active documentation set is synchronized.

### Phase 1 — scoped DSL foundation

- add type-specific creation methods for Template/Component/Section/Group/Element;
- use `$` as the standard current-scope callback receiver in screen composers;
- preserve lexical nesting with no hidden mutable parent cursor;
- keep generic `setTemplate/setComponent/setSection/setGroup/setElement` escape hatches where required.

### Phase 2 — direct setter API

- expose legal `set<Property>()` methods directly on the current scope;
- return current scope from setters for chaining;
- preserve node-specific type safety;
- keep defaults and exact schemas owned by NodeDefinitions.

### Phase 3 — child chaining semantics

- child creation executes a nested callback;
- after callback completion the method returns the parent scope;
- no explicit `end*()` navigation API;
- prove sibling creation remains readable and deterministic.

### Phase 4 — Partner Login convergence

- rewrite Login composer to the frozen DSL;
- preserve exact identity, hierarchy, theme output and action contract;
- prove canonical output parity.

### Phase 5 — Partner OTP convergence

- rewrite OTP composer through the same DSL;
- preserve `tpl_P6X8N3`, references, actions and wire behavior;
- no OTP-specific builder/action language.

### Phase 6 — remaining engine convergence

- update tests and examples to one authoring language;
- remove duplicate authoring paths only after zero production references;
- keep canonical validator and wire contract unchanged.

---

## 26. Required golden tests

At minimum:

- hierarchy/XOR rules reject invalid composition;
- type-specific creation methods serialize correct canonical `type`;
- concrete IDs remain unique;
- setters mutate only the current node instance;
- setter chaining returns current scope;
- child callback completion returns parent scope;
- no hidden parent cursor is required;
- default properties are emitted;
- legal defaults can be overridden per instance;
- one node override does not mutate another/default definition;
- non-default properties are omitted unless set;
- nested merge is deterministic;
- arrays replace rather than merge;
- unknown/illegal setters/properties are rejected;
- screen registry rejects duplicates/unknowns;
- node registry rejects duplicates/unknowns;
- action helpers serialize to canonical wire form;
- Login canonical output remains compatible;
- OTP canonical output remains compatible;
- API transport/auth behavior is unchanged;
- Redis-only OTP persistence is unchanged.

---

## 27. Permanent anti-patterns

Do not introduce:

```text
screen-specific reusable node types
screen inheritance/base-screen classes
public Builder class per node type
giant unrestricted properties object
global mutable builder cursor
manual parent-ID attachment
factory-of-factory composition
feature-specific action types
SDUI business logic in domains
SDUI tree construction in API surfaces
second canonical validator
second node definition registry
silent property dropping
explicit endComponent/endSection/endGroup navigation
screen-composer property category navigation such as base()/style()/content()/behavior()
long callback receiver names as the canonical authoring convention
```

---

## 28. Final developer mental model

A developer adding or reading a screen should think:

```text
What screen am I composing?
  screen root

What template type is it?
  stackTemplate(...) / formTemplate(...) / ...

What is the explicit hierarchy?
  Component → optional Section → optional Group → Element

What differs for this node?
  set<Property>()

What interaction should happen?
  setOnClick(action.*(...)) using ref.* values
```

The screen source should read like the canonical tree itself.

---

## 29. Final frozen architecture statement

> **CarBroz SDUI uses one canonical Composite presentation model and one small internal Builder DSL. The hierarchy remains explicit as Screen → Template → Component → optional Section → optional Group → Element. Reusable node type is encoded by readable creation methods such as `formTemplate`, `stackComponent`, `stackSection`, `rowGroup`, `textElement`, `inputElement` and `buttonElement`; the concrete ID is supplied once at creation. Every nested callback uses `$` as the current-node receiver. Properties are authored directly through legal `set<Property>()` methods such as `setSpacing`, `setPadding`, `setText`, `setLeading`, `setTrailing`, `setBinding` and `setOnClick`. Setters return the current scope; child creation returns the parent scope after the nested callback, so hierarchy remains readable without `end*()` calls or hidden mutable parent state. NodeDefinitions remain the single authority for type, legal children, exact schema, canonical defaults and legal capabilities. `SduiService` resolves, builds, validates and returns one canonical SDUI document, and no domain or API surface may become a second authoring authority.**
