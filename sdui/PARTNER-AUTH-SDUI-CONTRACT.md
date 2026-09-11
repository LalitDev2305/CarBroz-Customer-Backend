# Partner Authentication SDUI Contract

> **Status:** FROZEN BEHAVIOR + COMPOSITION CONTRACT
>
> **Architecture authority:** `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`
>
> **Interaction authority:** `sdui/engine/src/core/Action.ts` and canonical engine action/reference tests.
>
> **Security authority:** `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md` plus the backend constitutions.

This document freezes Partner Bootstrap → Login → OTP → authenticated Dashboard behavior and the Login/OTP SDUI composition contract. Screen composition belongs only to `sdui/engine`.

---

## 1. Ownership boundary

```text
Identity domain
  → authentication/business rules
  → OTP challenge lifecycle
  → user/session/credential creation

SDUI Engine
  → Login / OTP / Dashboard presentation composition
  → generic hierarchy/property/action/reference contracts
  → defaults/overrides
  → screen resolution + validation

API surface
  → HTTP routes
  → request adaptation
  → response serialization

Frontend runtime
  → bindings/context/response resolution
  → generic action execution
  → transient auth-flow state
  → hidden cooldown execution
  → destination verification + rendering
```

Domains and API surfaces must not become parallel screen-composition owners.

---

## 2. Loaded screen, Destination and node identity

Loaded screen owns:

```text
screen.screenId
screen.schemaVersion
screen.targetApp
screen.template.id
screen.template.type
```

Destination owns:

```text
screenId
templateId
templateType
endpoint
method
authentication
```

After fetch:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

Root-level `templateId` and `templateType` are not part of a loaded screen.

### 2.1 Unique-ID rule

```text
id   = unique identity of one concrete node instance
type = reusable rendering/composition definition
```

Concrete IDs are unique at every level:

```text
Template
Component
Section
Group
Element
```

Frozen Partner Auth template identities:

```text
Partner Login template.id = tpl_7K2M9Q
Partner OTP   template.id = tpl_P6X8N3
```

These IDs are stable until the contract is deliberately versioned.

---

## 3. Canonical hierarchy

Legal branches:

```text
Screen
  → Template
      → Component
          → Element
```

```text
Screen
  → Template
      → Component
          → Section
              → Element
```

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

Login and OTP must use this same canonical hierarchy.

---

## 4. Frozen scoped authoring rule

Partner Login and OTP use the engine-wide scoped setter DSL.

Type-specific creation methods encode reusable node type and accept the concrete ID once:

```ts
$.stackTemplate('tpl_7K2M9Q', $ => { ... });
$.formTemplate('tpl_P6X8N3', $ => { ... });
$.stackComponent('otp_content', $ => { ... });
$.stackSection('otp_action_section', $ => { ... });
$.rowGroup('otp_fields_group', $ => { ... });
$.textElement('otp_screen_title', $ => { ... });
$.inputElement('otp_code_input', $ => { ... });
$.buttonElement('otp_verify_button', $ => { ... });
```

`$` always means the current node in that lexical scope.

Properties are set directly:

```ts
$.setSpacing(...)
 .setPadding(...)
 .setText(...)
 .setFontSize(...)
 .setLeading(...)
 .setTrailing(...)
 .setBinding(...)
 .setEnabled(...)
 .setOnClick(...);
```

No separate property-category navigation is part of the Partner Auth screen-composer API.

Setter calls return the current scope. Child creation executes the nested callback and returns the parent scope. No `end*()` hierarchy navigation or hidden mutable parent cursor is allowed.

---

## 5. Generic action/reference contract

References:

```text
$binding
$context
$response
$literal
```

Authoring:

```ts
ref.binding(...)
ref.context(...)
ref.response(...)
ref.literal(...)
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

Request-dependent navigation uses `request` with `responseMode = destination`.

Execution:

```text
validate
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

No OTP-specific action type is allowed.

---

## 6. Partner Login — frozen golden reference

```text
screenId      = partner_login
template.id   = tpl_7K2M9Q
template.type = stack_template
targetApp     = PARTNER
route         = GET /api/v1/partner/screen/auth_login
```

Continue action:

```text
POST /api/v1/partner/auth/send_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Body:

```json
{
  "phoneNumber": { "$binding": "mobileNumber" },
  "deviceId": { "$context": "deviceId" }
}
```

Frozen Login composition:

```text
Screen partner_login
└── Template tpl_7K2M9Q / stack_template
    ├── Component brand/header / stack_component
    │   ├── image: logo
    │   ├── text: CarBroz
    │   ├── text: PARTNER + leading/trailing dividers
    │   ├── text: tagline
    │   ├── text: title
    │   └── text: subtitle
    ├── Component login interaction / stack_component
    │   ├── Section / Group: mobile input
    │   └── Section: Continue + legal text
    └── Component hero image / stack_component
```

Owner:

```text
sdui/engine/src/screens/partner/PartnerLoginScreen.ts
```

---

## 7. Send OTP destination — frozen

Successful Send OTP returns:

```text
screenId       = partner_otp
templateId     = tpl_P6X8N3
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

OTP plaintext/hash is never returned.

The Send OTP response is the source of active challenge identity. A successful resend may return a new challenge ID; verification always uses the newest successful challenge.

---

## 8. Partner OTP screen — frozen final composition

```text
screenId      = partner_otp
template.id   = tpl_P6X8N3
template.type = form_template
targetApp     = PARTNER
route         = GET /api/v1/partner/screen/auth_otp
```

Owner:

```text
sdui/engine/src/screens/partner/PartnerOtpScreen.ts
```

Frozen tree:

```text
Screen partner_otp
└── Template tpl_P6X8N3 / form_template
    ├── Component otp_brand_content / stack_component
    │   ├── Element otp_brand_logo / image
    │   ├── Element otp_brand_name / text
    │   ├── Element otp_partner_label / text
    │   │   ├── leading horizontal divider property
    │   │   └── trailing horizontal divider property
    │   ├── Element otp_brand_tagline / text
    │   ├── Element otp_screen_title / text
    │   ├── Element otp_screen_subtitle / text
    │   └── Element otp_phone_number / text + trailing edit icon
    │
    └── Component otp_content / stack_component
        ├── Section otp_field_section / stack_section
        │   └── Group otp_fields_group / stack_group or row_group
        │       └── Element otp_code_input / input
        │
        └── Section otp_action_section / stack_section
            ├── Element otp_resend_text / text
            ├── Element otp_verify_button / button
            └── Element otp_legal_text / text
```

The first OTP component mirrors the Login brand/header composition pattern while using unique OTP node IDs.

---

## 9. OTP authoring target

Conceptually:

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
       .stackComponent('otp_brand_content', $ =>
         $.setSpacing(6)
          .setHorizontalAlignment('center')
          .imageElement('otp_brand_logo', $ =>
            $.setUrl('/images/carbroz_logo.png')
             .setWidth(120)
             .setHeight(96)
          )
          .textElement('otp_brand_name', $ =>
            $.setText('CarBroz')
             .setFontSize(44)
             .setFontWeight(700)
             .setTextAlign('center')
          )
       )
       .stackComponent('otp_content', $ =>
         $.setSpacing(18)
          .stackSection('otp_field_section', $ =>
            $.rowGroup('otp_fields_group', $ =>
              $.inputElement('otp_code_input', $ =>
                $.setMaxLength(6)
                 .setKeyboardType('number')
                 .setBinding('otp')
                 .setValidation({
                   required: true,
                   pattern: '^[0-9]{6}$',
                   message: 'Enter the 6-digit OTP',
                 })
              )
            )
          )
          .stackSection('otp_action_section', $ =>
            $.textElement('otp_resend_text', $ =>
              $.setText('Resend OTP')
               .setEnabled(false)
               .setOnClick(action.request({
                 method: 'POST',
                 endpoint: '/api/v1/partner/auth/send_otp',
                 authentication: 'NONE',
                 validate: false,
                 responseMode: 'none',
                 body: {
                   phoneNumber: ref.context('authFlow.phoneNumber'),
                   deviceId: ref.context('deviceId'),
                 },
               }))
            )
            .buttonElement('otp_verify_button', $ =>
              $.setText('Verify & Continue')
               .setOnClick(action.request({
                 method: 'POST',
                 endpoint: '/api/v1/partner/auth/verify_otp',
                 authentication: 'NONE',
                 validate: true,
                 responseMode: 'destination',
                 body: {
                   challengeId: ref.response('data.challengeId'),
                   phoneNumber: ref.context('authFlow.phoneNumber'),
                   otp: ref.binding('otp'),
                   deviceId: ref.context('deviceId'),
                 },
               }))
            )
          )
       )
    ),
);
```

This freezes the authoring shape, not a separate OTP framework.

---

## 10. Shared vs different Login/OTP data

```text
Login                               OTP
-----                               ---
logo                                logo
CarBroz                             CarBroz
PARTNER + leading/trailing lines    PARTNER + leading/trailing lines
tagline                             tagline
Welcome Partner!                    Verify Your Number
Login to continue your journey      We have sent a 6-digit code to
```

OTP adds:

```text
+91 <submitted phone number>   [trailing edit icon]
```

The phone number comes from runtime auth-flow context and is never hardcoded.

---

## 11. Leading/trailing and rich text

Leading/trailing content is configured directly on the owning Element:

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

Rich text is generic:

```ts
$.setSpans([
  { text: 'Verify ' },
  { text: 'Your', color: '#13B8B5' },
  { text: ' Number' },
]);
```

Legal terms may carry generic `external_uri` actions.

---

## 12. OTP binding and verification

Six visual OTP cells represent one logical value.

Canonical binding key:

```text
otp
```

Request-facing value:

```text
{ "$binding": "otp" }
```

Validation:

```text
required = true
pattern  = ^[0-9]{6}$
```

Verify request:

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Canonical body references:

```text
challengeId ← latest successful Send OTP challenge
phoneNumber ← { $context: "authFlow.phoneNumber" }
otp         ← { $binding: "otp" }
deviceId    ← { $context: "deviceId" }
```

Verification always uses the newest successful challenge after resend.

---

## 13. Resend OTP + hidden cooldown

The approved UX has no visible countdown.

```text
COOLDOWN
  Resend OTP visible
  disabled / grey
  not clickable
  timer hidden

READY
  Resend OTP visible
  enabled
  clickable
```

Initial successful Login → Send OTP starts the hidden cooldown.

When READY and tapped:

```text
1. disable Resend immediately
2. POST /api/v1/partner/auth/send_otp
3. use active phoneNumber + deviceId
4. on success retain newest challengeId/response
5. restart hidden cooldown
6. enable again when cooldown completes
7. on failure expose/reduce error and restore retryable state when allowed
```

OTP validity and resend cooldown are different concepts:

```text
expiresInSeconds   = OTP/challenge validity
resendAfterSeconds = resend eligibility cooldown
```

Never derive resend cooldown from `expiresInSeconds`.

---

## 14. Transient auth-flow state

After successful Send OTP and before OTP navigation retain at minimum:

```text
authFlow.phoneNumber
latest successful Send OTP response/challenge
resend eligibility/cooldown state
```

After successful resend replace the previous challenge reference with the newest successful challenge.

Clear transient auth-flow state after successful Verify OTP, abandoned auth flow, logout/reset or a new auth flow.

OTP plaintext is never reusable persistent application state.

---

## 15. Verify OTP security behavior

Security order:

```text
load bound challenge
→ validate lifecycle / phone / device / attempt state
→ verify secret hash
→ atomically consume one-time challenge
→ user/session creation
→ refresh/access credential issuance
→ authenticated destination
```

Concurrent/replay verification is fail-closed: at most one consume succeeds.

No SDUI refactor may change this ordering.

---

## 16. Redis OTP persistence

Production OTP persistence remains:

```text
Identity IOtpChallengeRepository
        ↑
RedisOtpChallengeRepository
        ↑
shared singleton redisClient
```

Forbidden:

```text
Prisma production OTP challenge persistence
production in-memory fallback
dual write
OTP plaintext persistence/response
screen-owned OTP storage
```

Test-only deterministic persistence is allowed only at executable test-composition boundaries.

---

## 17. Authenticated Partner Dashboard destination

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

Authenticated Bootstrap and Verify OTP return the same Dashboard Destination.

---

## 18. Canonical defaults and theme

Login and OTP use the same engine-wide NodeDefinition/default rules.

Screen composers set only values that differ from canonical node defaults.

Theme is resolved from the engine-wide default screen theme. A screen may use `setTheme(...)` only for genuine screen-level differences.

One screen override never mutates another screen or global defaults.

---

## 19. Generic events

Elements may bind generic events such as:

```text
onClick
onLongClick
onValueChange
onFocus
onBlur
```

Screen-composer authoring uses setters such as:

```ts
$.setOnClick(...)
$.setOnLongClick(...)
```

Only the generic action vocabulary is allowed.

---

## 20. SESSION error semantics

SESSION-protected fetches never convert missing/invalid bearer credentials into 500 responses.

Transport auth failures remain:

```text
401 UNAUTHORIZED
403 FORBIDDEN
```

No internal credential/plugin detail leakage.

---

## 21. Full-flow proof required

Executable proof must cover:

```text
guest Bootstrap
→ Login Screen
→ Send OTP
→ OTP Destination tpl_P6X8N3
→ OTP Screen
→ Verify OTP
→ Dashboard Destination
→ unauthenticated Dashboard fetch = 401
→ authenticated Dashboard fetch = 200
```

Also prove:

- Login/OTP canonical screen identities;
- unique concrete node IDs;
- legal hierarchy/XOR rules;
- type-specific creation methods serialize correct types;
- direct setters mutate only current node;
- child callback returns parent scope;
- generic actions/references serialize canonically;
- newest challenge used after resend;
- Redis-only production OTP persistence;
- focused architecture gates remain green.

---

## 22. Frozen final statement

> **Partner Login and Partner OTP use the same canonical SDUI engine and the same explicit Screen → Template → Component → optional Section → optional Group → Element hierarchy. Type-specific creation methods encode reusable type; concrete node IDs are supplied once. Every nested callback uses `$` as the current node. Properties are authored directly with legal `set<Property>()` methods, including `setText`, `setSpacing`, `setPadding`, `setLeading`, `setTrailing`, `setBinding`, `setEnabled` and `setOnClick`. Setters return the current scope and child creation returns the parent scope after the child callback. The wire JSON, generic actions/references, Login/OTP destinations, OTP security behavior and Redis persistence remain canonical and independently validated.**
