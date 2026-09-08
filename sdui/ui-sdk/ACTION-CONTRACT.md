# CarBroz SDUI Action & Binding Contract

> **Status:** FROZEN V1 contract
> **Owner:** `sdui/ui-sdk`
> **Authority:** subordinate to `docs/MASTER-BACKEND-CONSTITUTION.md`

This document defines the generic, product-neutral interaction language emitted by SDUI documents. Business behavior invoked by an action remains in its owning bounded context. The UI SDK describes intent only.

## 1. Core rules

- Elements are terminal visual/interactive leaves and may declare event-keyed `actions`.
- The SDUI runtime must not know product screens such as Login, OTP, Booking or Profile.
- Actions are semantic and generic. Feature-specific action types are forbidden.
- The server SDUI document is immutable after acceptance. Local interaction changes are runtime state overlays; actions do not mutate the structural tree.
- Structural parent/child hierarchy and interactive source/target relationships are separate concepts.
- Action payloads are typed contracts, not an unrestricted scripting language.
- Arbitrary expression evaluation is forbidden.

## 2. Frozen V1 action vocabulary

```text
request       API/business request
navigate      dynamic SDUI destination navigation
present       show a dialog, bottom sheet or popup
 dismiss      close the active/target presentation
state         controlled local runtime-state mutation
external_uri  open an external URI through a platform capability
sequence      ordered execution when order is genuinely required
```

Event names remain keys on `actions`, for example `onClick`, `onLongClick`, `onValueChange`, `onFocus`, and `onBlur`. Only events supported by the consuming element/runtime may execute.

## 3. Dynamic destination

A destination is an instruction describing a future SDUI document:

```json
{
  "screenId": "partner_login",
  "templateId": "tpl_7K2M9Q",
  "templateType": "stack_template",
  "endpoint": "/api/v1/partner/screen/auth_login",
  "method": "GET",
  "authentication": "NONE"
}
```

Semantics:

- `screenId` identifies the logical backend-defined screen.
- `templateId` is the opaque unique template/navigation identity and is the current back-stack identity. Clients must not derive business meaning from it. Preferred generated format: `tpl_<short-unique-id>`, e.g. `tpl_7K2M9Q`.
- `templateType` tells the dynamic navigation/rendering runtime which generic template capability the destination requires.
- `endpoint` identifies where the concrete SDUI document is fetched.

After fetch, the runtime must verify:

```text
expected.screenId      == response.screenId
expected.templateId    == response.template.id
expected.templateType  == response.template.type
```

A loaded `SduiScreen` therefore does not repeat `templateId` or `templateType` at its root. The canonical loaded-document owners are `template.id` and `template.type`. Destination contracts intentionally retain both fields because they are pre-fetch navigation/rendering expectations.

## 4. Binding

An interactive input declares the runtime binding key it owns:

```json
{
  "id": "mobile_number",
  "type": "input",
  "binding": { "key": "mobileNumber" }
}
```

Actions reference runtime values declaratively:

```json
{ "$binding": "mobileNumber" }
```

Frozen binding/reference vocabulary:

```text
$binding   current runtime binding value
$literal   explicit literal value
$response  value from the current successful action response context
$context   approved runtime/platform context value
```

Only one reference source is legal per reference object. References are data lookup instructions, not expressions. JavaScript/template/expression syntax is forbidden.

## 5. Request action

Example Login Continue action:

```json
{
  "actions": {
    "onClick": {
      "type": "request",
      "payload": {
        "method": "POST",
        "endpoint": "/api/v1/partner/auth/send_otp",
        "authentication": "NONE",
        "validate": true,
        "body": {
          "mobileNumber": { "$binding": "mobileNumber" }
        },
        "responseMode": "destination"
      }
    }
  }
}
```

`validate: true` requires applicable form/input validation before the request is prepared.

`responseMode: "destination"` means navigation is conditional on a successful request. The successful business response supplies a dynamic destination; the client does not execute an independent parallel navigation action. Failed requests must not navigate.

## 6. Navigate action

Use when navigation itself does not depend on an API/business mutation:

```json
{
  "type": "navigate",
  "payload": {
    "screenId": "partner_profile",
    "templateId": "tpl_A4X8NP",
    "templateType": "stack_template",
    "endpoint": "/api/v1/partner/screen/profile",
    "method": "GET",
    "authentication": "SESSION"
  }
}
```

The runtime remains screen-name agnostic.

## 7. Presentation actions

`present` handles generic overlays without an API call:

```json
{
  "type": "present",
  "targetId": "cancel_booking_dialog",
  "payload": { "presentation": "dialog" }
}
```

Supported V1 presentation modes:

```text
dialog
bottom_sheet
popup
```

`dismiss` closes the active presentation or an optional `targetId`.

## 8. Local state actions

Interactive relationships between already-defined nodes use controlled runtime state:

```json
{
  "type": "state",
  "targetId": "referral_input",
  "payload": {
    "operation": "toggle",
    "property": "visible"
  }
}
```

V1 state operations:

```text
set
toggle
```

V1 mutable runtime-state properties:

```text
visible
enabled
selected
expanded
checked
loading
value
```

Actions must not mutate arbitrary visual paths such as `background.color`. Renderers/definitions decide how semantic state appears.

## 9. External URI

External navigation uses a platform capability rather than feature-specific code:

```json
{
  "type": "external_uri",
  "payload": {
    "uri": { "$literal": "https://example.com/terms" }
  }
}
```

The client must apply its platform/security allow-list policy before opening a URI.

## 10. Sequence

Use `sequence` only when execution order genuinely matters:

```json
{
  "type": "sequence",
  "payload": {
    "actions": [
      {
        "type": "state",
        "targetId": "individual_fields",
        "payload": { "operation": "set", "property": "visible", "value": true }
      },
      {
        "type": "state",
        "targetId": "organization_fields",
        "payload": { "operation": "set", "property": "visible", "value": false }
      }
    ]
  }
}
```

Do not use sequence for request-then-navigation when navigation depends on request success; use request `responseMode: destination` instead.

## 11. Ownership

```text
sdui/ui-sdk
  owns generic action, destination, binding/reference and runtime-state vocabulary

business bounded context
  owns business behavior invoked by request actions

apps/api surface
  owns HTTP exposure/adaptation

frontend dynamic runtime
  validates, resolves bindings, prepares actions, executes generic capabilities,
  maintains runtime state/back stack, verifies destinations and renders SDUI
```

No feature-specific action engine or screen-name switch is allowed.

## 12. Versioning rule

Changing the meaning of an existing action/reference is a breaking SDUI protocol change. Additive vocabulary must remain safely rejectable/ignorable according to the client compatibility policy. Contract changes require schema tests and documentation updates before production screen documents use them.
