# Partner Authentication SDUI Contract

> **Status:** FROZEN BEHAVIOR + COMPOSITION CONTRACT
>
> **Architecture authority:** `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`
>
> **Security authority:** `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md` plus the backend constitutions.

## 1. Ownership

```text
Identity
  -> authentication/session/OTP business rules
  -> OTP challenge lifecycle

sdui/engine
  -> Login / OTP / Dashboard presentation composition
  -> generic hierarchy, setters, actions, references, validation

apps/api
  -> HTTP transport/adaptation only

frontend runtime
  -> bindings/context/response resolution
  -> generic action execution
  -> transient auth-flow state
  -> hidden resend cooldown
  -> destination fetch/verification/rendering
```

No domain or API surface may become a second screen-composition owner.

## 2. Canonical hierarchy

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

## 3. Current authoring vocabulary

Current registered structural/node types used by Partner Auth are:

```text
stack_template
form_template
stack_component
stack_section
stack_group
text
image
input
button
```

Typed creation methods:

```ts
$.stackTemplate(id, $ => ...)
$.formTemplate(id, $ => ...)
$.stackComponent(id, $ => ...)
$.stackSection(id, $ => ...)
$.stackGroup(id, $ => ...)
$.textElement(id, $ => ...)
$.imageElement(id, $ => ...)
$.inputElement(id, $ => ...)
$.buttonElement(id, $ => ...)
```

Screens whose primary interaction accepts user input and validates/submits data use `form_template`. Partner Login and Partner OTP therefore both use `form_template`.

Horizontal rows use the registered `stack_group` plus orientation:

```ts
$.stackGroup('otp_fields_group', $ =>
  $.setOrientation('horizontal')
   .inputElement('otp_code_input', $ => ...)
)
```

There is no current `row_group` Partner Auth contract.

## 4. Screen root and direct setters

Screen identity is supplied once:

```ts
sdui.screen('partner_login', 'PARTNER', $ => { ... });
sdui.screen('partner_otp', 'PARTNER', $ => { ... });
```

`$` is always the current lexical scope.

Properties are direct setters:

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

No composer-facing `base()/style()/content()/behavior()` navigation, hidden parent cursor or `end*()` navigation is allowed.

## 5. Theme

Partner Login and OTP use the engine-wide `DEFAULT_SDUI_THEME` without repeating it.

A real screen difference uses:

```ts
$.setTheme($ =>
  $.setStatusBar('default')
   .setGradientAngle(90)
);
```

Theme override is scoped, merged over the default, isolated per screen and strictly validated. Raw object-style `setTheme({...})` is not part of the frozen composer API.

## 6. Generic actions and references

References:

```text
$binding
$context
$response
$literal
```

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

Authoring uses `ref.*` and `action.*`. Request-dependent navigation uses `request` with `responseMode = destination`.

## 7. Partner Login — frozen

```text
screenId      = partner_login
template.id   = tpl_7K2M9Q
template.type = form_template
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

Composition:

```text
Screen partner_login
└── form_template tpl_7K2M9Q
    ├── stack_component brand_content
    │   ├── image brand_logo
    │   ├── text brand_name
    │   ├── text partner_label + leading/trailing divider accessories
    │   ├── text brand_tagline
    │   ├── text welcome_title
    │   └── text welcome_subtitle
    ├── stack_component login_content
    │   ├── stack_section mobile_field_section
    │   │   └── stack_group mobile_field, orientation=horizontal
    │   │       ├── text country_code
    │   │       └── input mobile_number
    │   └── stack_section action_section
    │       ├── button continue_button
    │       └── text legal_text
    └── stack_component hero_content
        └── image hero_car
```

Owner:

```text
sdui/engine/src/screens/partner/PartnerLoginScreen.ts
```

## 8. Send OTP destination — frozen

```text
screenId       = partner_otp
templateId     = tpl_P6X8N3
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

OTP plaintext/hash is never returned.

The latest successful Send OTP response is the active challenge source. A successful resend replaces the active challenge.

## 9. Partner OTP screen — frozen

```text
screenId      = partner_otp
template.id   = tpl_P6X8N3
template.type = form_template
targetApp     = PARTNER
route         = GET /api/v1/partner/screen/auth_otp
```

Composition:

```text
Screen partner_otp
└── form_template tpl_P6X8N3
    ├── stack_component otp_brand_content
    │   ├── image otp_brand_logo
    │   ├── text otp_brand_name
    │   ├── text otp_partner_label + leading/trailing divider accessories
    │   ├── text otp_brand_tagline
    │   ├── text otp_screen_title
    │   ├── text otp_screen_subtitle
    │   └── text otp_phone_number + trailing edit icon accessory
    └── stack_component otp_content
        ├── stack_section otp_field_section
        │   └── stack_group otp_fields_group, orientation=horizontal
        │       └── input otp_code_input
        └── stack_section otp_action_section
            ├── text otp_resend_text
            ├── button otp_verify_button
            └── text otp_legal_text
```

Owner:

```text
sdui/engine/src/screens/partner/PartnerOtpScreen.ts
```

## 10. OTP binding and verify action

Six visual OTP cells represent one logical value:

```text
otp
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

Body references:

```text
challengeId <- latest successful Send OTP challenge
phoneNumber <- { $context: "authFlow.phoneNumber" }
otp         <- { $binding: "otp" }
deviceId    <- { $context: "deviceId" }
```

## 11. Resend OTP UX

No visible countdown is rendered.

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

READY tap uses the same Send OTP endpoint. Resend is disabled immediately, newest successful challenge is retained, and hidden cooldown restarts.

```text
expiresInSeconds   = OTP/challenge validity
resendAfterSeconds = resend eligibility cooldown
```

Never derive resend cooldown from OTP expiry.

## 12. Transient auth-flow state

Retain at minimum between Send OTP and Verify OTP:

```text
authFlow.phoneNumber
latest successful Send OTP response/challenge
resend cooldown/eligibility state
```

Clear after successful Verify OTP, abandoned auth flow, logout/reset or a new auth flow. OTP plaintext is never reusable persistent application state.

## 13. Verify OTP security order

```text
load bound challenge
-> validate lifecycle / phone / device / attempt state
-> verify secret hash
-> atomically consume one-time challenge
-> user/session creation
-> access/refresh credential issuance
-> authenticated destination
```

Concurrent/replay verification is fail-closed: at most one consume succeeds.

## 14. Redis OTP persistence

Production persistence remains:

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

## 15. Dashboard destination

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

Authenticated Bootstrap and Verify OTP return the same Dashboard Destination.

## 16. SESSION errors

Missing/invalid SESSION credentials remain safe transport errors:

```text
401 UNAUTHORIZED
403 FORBIDDEN
```

They do not become 500 responses and do not leak internal credential details.

## 17. Required focused proof

Executable proof must cover:

```text
guest Bootstrap
-> Login Screen
-> Send OTP
-> OTP Destination tpl_P6X8N3
-> OTP Screen
-> Verify OTP
-> Dashboard Destination
-> unauthenticated Dashboard fetch = 401
-> authenticated Dashboard fetch = 200
```

Also prove:

- exact Login/OTP IDs and types;
- Login and OTP both use `form_template` because they are input/submission screens;
- direct Screen root API;
- current registered typed methods only;
- `stack_group + horizontal orientation` for row layouts;
- legal hierarchy/XOR;
- direct setter isolation/chaining;
- child callback returns parent scope;
- default/theme isolation;
- generic action/reference serialization;
- newest challenge after resend;
- Redis-only production OTP persistence;
- focused architecture/build/lint/test gates green on exact SHA when a freeze/release candidate is required.

## 18. Frozen final statement

> **Partner Login and OTP use one canonical SDUI engine and the explicit Screen -> Template -> Component -> optional Section -> optional Group -> Element hierarchy. Both screens use `form_template` because their primary interaction accepts and submits user input. Screen identity is direct, `$` is the current lexical scope, properties are `set<Property>()`, current typed methods mirror only registered NodeDefinitions, and horizontal rows use `stackGroup(...).setOrientation('horizontal')`. Theme is globally defaulted and scoped overrides use `setTheme($ => ...)`. Auth behavior, Destination identity, Redis OTP security and canonical wire semantics remain unchanged.**
