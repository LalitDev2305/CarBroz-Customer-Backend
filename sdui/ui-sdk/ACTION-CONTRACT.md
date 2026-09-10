# CarBroz SDUI Action, Event, Binding & Destination Contract

> **Status:** FROZEN GENERIC CONTRACT — synchronized with `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`
>
> **Migration ownership:** the canonical long-term owner is `sdui/engine`. This file remains the wire-contract authority during `ui-sdk` migration so existing clients and tests retain one stable protocol.
>
> **Rule:** implementation may improve authoring APIs, but the serialized action/reference/destination semantics below must not drift without an explicit contract/version change.

This document defines the generic, product-neutral interaction language emitted by SDUI documents. Business behavior invoked by actions remains in the owning bounded context. SDUI describes intent only.

---

## 1. Core rules

- Elements are terminal visual/interactive leaves and may declare event-keyed `actions`.
- The runtime must not know product screens such as Login, OTP, Booking or Profile.
- Actions are semantic and generic. Feature-specific action types are forbidden.
- Structural hierarchy and interactive source/target relationships are separate concepts.
- Accepted SDUI structure is immutable; local runtime changes are semantic state overlays, not tree mutation.
- Action payloads are typed contracts, not unrestricted scripting.
- Arbitrary JavaScript/template/expression evaluation is forbidden.
- Screen composers must author references through typed helpers, not hand-written protocol markers.

---

## 2. Frozen generic action vocabulary

```text
request       API/business request
navigate      dynamic SDUI destination navigation
present       show a dialog, bottom sheet or popup
dismiss       close the active/target presentation
state         controlled local runtime-state mutation
external_uri  open an external URI through a platform capability
sequence      ordered execution when order is genuinely required
```

No action may be named after a product flow such as:

```text
send_otp
verify_otp
open_booking
accept_job
```

Those are business intents represented through generic actions.

---

## 3. Frozen authoring API direction

Screen-composer code should use one discoverable namespace:

```ts
action.request(...)
action.navigate(...)
action.present(...)
action.dismiss(...)
action.state(...)
action.externalUri(...)
action.sequence(...)
```

References use:

```ts
ref.binding(...)
ref.context(...)
ref.response(...)
ref.literal(...)
```

This is an authoring convenience only. Canonical wire JSON remains the contract below.

A fluent `ActionBuilder` class hierarchy is not authorized.

---

## 4. Event contract

Actions are stored under event keys:

```json
{
  "actions": {
    "onClick": { "type": "...", "payload": {} }
  }
}
```

Initial generic event vocabulary includes:

```text
onClick
onLongClick
onValueChange
onFocus
onBlur
```

Node definitions may advertise the events they support. The builder should expose only legal event methods where practical, and final validation must reject unsupported event/node combinations once event metadata is available.

Example authoring:

```ts
button.behavior()
  .onClick(action.request(...))
  .onLongClick(action.present(...));
```

The event name is generic runtime behavior; it is not part of business-domain policy.

---

## 5. Dynamic Destination contract

A Destination describes a future SDUI document:

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

Fields:

```text
screenId        logical backend screen identity
templateId      expected destination template identity
templateType    expected generic template rendering capability
endpoint        endpoint used to fetch the loaded SDUI document
method          request method, currently GET for screen destinations
authentication  NONE | SESSION
```

After fetch the runtime must verify:

```text
expected.screenId      == response.screenId
expected.templateId    == response.template.id
expected.templateType  == response.template.type
```

A loaded `SduiScreen` does not repeat `templateId` or `templateType` at root; canonical owners are `template.id` and `template.type`.

The runtime must not infer an endpoint from a screen/template ID.

---

## 6. Binding and value references

An interactive element may own a binding:

```json
{
  "id": "mobile_number",
  "type": "input",
  "binding": { "key": "mobileNumber" }
}
```

Frozen reference forms:

```json
{ "$binding": "mobileNumber" }
{ "$context": "deviceId" }
{ "$response": "data.challengeId" }
{ "$literal": "value" }
```

Semantics:

```text
$binding   current runtime binding value
$context   approved runtime/platform/flow context value
$response  value from retained successful action-response context
$literal   explicit literal value
```

Exactly one reference source is legal per reference object.

References are lookup instructions only. They do not support expressions, arbitrary functions, property scripts or template evaluation.

Screen authoring must use `ref.*`; manually encoding `$binding`, `$context`, `$response` or `$literal` in migrated screen composers is forbidden.

---

## 7. Request action

Canonical example:

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
          "phoneNumber": { "$binding": "mobileNumber" },
          "deviceId": { "$context": "deviceId" }
        },
        "responseMode": "destination"
      }
    }
  }
}
```

Authoring equivalent:

```ts
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
});
```

`validate: true` requires applicable input/form validation before preparing the request.

### 7.1 `responseMode: destination`

This means destination navigation is conditional on request success:

```text
validate
→ resolve references
→ execute request
→ failure: expose/reduce error, no navigation
→ success: retain required response/flow context
→ validate Destination
→ satisfy authentication requirement
→ fetch screen
→ verify destination/screen identity
→ navigate/render
```

Do not model dependent navigation as `sequence(request, navigate)`.

---

## 8. Navigate action

Use when navigation itself does not depend on a preceding business mutation:

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

Authoring:

```ts
action.navigate(destination)
```

The runtime stays screen-name agnostic.

---

## 9. Present and dismiss

`present` handles generic overlays:

```json
{
  "type": "present",
  "targetId": "cancel_booking_dialog",
  "payload": { "presentation": "dialog" }
}
```

Supported presentation modes:

```text
dialog
bottom_sheet
popup
```

`dismiss` closes the active presentation or optional target presentation.

Authoring:

```ts
action.present({ targetId: 'cancel_booking_dialog', presentation: 'dialog' })
action.dismiss({ targetId: 'cancel_booking_dialog' })
```

---

## 10. State action

Interactive relationships between already-defined nodes use controlled semantic runtime state:

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

Supported operations:

```text
set
toggle
```

Supported semantic runtime properties:

```text
visible
enabled
selected
expanded
checked
loading
value
```

Actions must not mutate arbitrary visual paths such as `background.color`. Definitions/renderers decide how semantic state is rendered.

Structural parent-child ownership never changes because of a state action.

---

## 11. External URI

```json
{
  "type": "external_uri",
  "payload": {
    "uri": { "$literal": "https://example.com/terms" }
  }
}
```

The client must apply its platform/security allow-list policy before opening the URI.

Authoring:

```ts
action.externalUri({ uri: ref.literal('https://example.com/terms') })
```

---

## 12. Sequence

Use only when generic action execution order genuinely matters:

```json
{
  "type": "sequence",
  "payload": {
    "actions": [
      {
        "type": "state",
        "targetId": "individual_fields",
        "payload": {
          "operation": "set",
          "property": "visible",
          "value": true
        }
      },
      {
        "type": "state",
        "targetId": "organization_fields",
        "payload": {
          "operation": "set",
          "property": "visible",
          "value": false
        }
      }
    ]
  }
}
```

Do not use Sequence for request-success-dependent navigation.

---

## 13. Frontend execution architecture

The backend emits typed generic action data. The frontend runtime should execute through isolated generic handlers/strategies, conceptually:

```text
ActionExecutor
  ├── RequestActionHandler
  ├── NavigateActionHandler
  ├── PresentActionHandler
  ├── DismissActionHandler
  ├── StateActionHandler
  ├── ExternalUriActionHandler
  └── SequenceActionHandler
```

This is a runtime concept, not a requirement for backend class names.

Adding one future generic action type should add its contract + compatible runtime handler without changing unrelated screen composers.

No product-screen switch statements are allowed in the generic runtime.

---

## 14. Ownership

Final ownership target:

```text
sdui/engine
  owns generic action, event, destination, binding/reference and semantic state vocabulary
  owns typed action/ref authoring helpers
  owns canonical SDUI validation

business bounded context
  owns business behavior invoked by request actions

apps/api
  owns HTTP transport/adaptation only

frontend dynamic runtime
  resolves references
  validates/executes generic actions
  owns transient client state/back stack
  verifies destinations
  renders SDUI
```

During migration `sdui/ui-sdk` may still physically contain canonical schemas, but it must not evolve into a competing permanent owner.

---

## 15. Validation requirements

Final SDUI validation must reject:

- unknown action types;
- malformed payloads;
- multiple reference-source markers in one reference;
- unsupported authentication/method values;
- malformed Destinations;
- unsupported event/node combinations once metadata is defined;
- feature-specific/unregistered action types;
- invalid Sequence children;
- arbitrary state property mutation.

Validation must not silently repair/drop invalid actions.

---

## 16. Versioning rule

Changing the meaning of an existing action/reference/destination is a breaking SDUI protocol change.

Additive vocabulary requires:

1. architecture/document update first;
2. schema/type update;
3. client compatibility decision;
4. handler support where executable;
5. contract tests;
6. only then production screen usage.

Existing screens remain unchanged unless they intentionally adopt the new capability.
