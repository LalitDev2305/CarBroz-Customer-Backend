# CarBroz SDUI Compose Contract & Implementation Plan

> **Status:** DESIGN FREEZE CANDIDATE — documentation first; no implementation is authorized by this document alone.
>
> **Authority:** Subordinate to `docs/MASTER-BACKEND-CONSTITUTION.md`, `docs/PRODUCTION_FREEZE_CONSTITUTION.md`, and `docs/ENGINEERING-DOCUMENTATION-STANDARD.md`. If this document conflicts with a higher authority, the higher authority wins and this document must be corrected before implementation.
>
> **Scope:** Generic SDUI language and the Partner Login screen as the first proving composition. This document does not define frontend implementation and does not authorize a parallel SDUI engine.

---

## 1. Purpose

This document freezes the intended evolution of the CarBroz Server-Driven UI contract before production code is changed. It answers:

- what Template, Component, Section, Group and Element mean;
- which hierarchy paths are legal;
- how the structural hierarchy maps conceptually to Jetpack Compose layout semantics;
- which properties belong to a parent container and which belong to a child;
- how leading/trailing accessories work without violating the terminal-Element invariant;
- how generic SDUI definitions are registered and reused;
- where runtime screen documents live and how they are published;
- which backend artifacts may be changed or introduced;
- what every proposed artifact owns, who calls it, what it may depend on and what it must never own;
- the implementation sequence and executable proof required before the contract is considered production-ready.

The central design goal is **a small, reusable layout language**, not a collection of screen-specific types.

---

## 2. Non-negotiable architecture boundaries

### 2.1 Existing ownership remains authoritative

```text
sdui/
├── ui-sdk/      # generic SDUI language, composition, validation and serialization
└── registry/    # runtime persistence, draft/publish/version/retrieval lifecycle
```

There MUST NOT be a second SDUI engine, Partner-specific SDK, Login SDK, renderer package, or screen-specific hierarchy.

### 2.2 Generic language versus runtime document

```text
UI SDK
  defines what is legal
       ↓
Registry
  stores and publishes legal documents
       ↓
Runtime API
  retrieves a published document for a target application
       ↓
Client
  interprets the generic contract
```

`partner_login` is runtime/product data. It is **not** a reusable UI SDK definition type.

Forbidden examples:

```text
LoginTemplate
PartnerLoginComponent
MobileLoginGroup
PhoneInputComponent
PartnerTextElement
```

Reusable examples:

```text
stack_template
stack_component
stack_section
stack_group
text
image
icon
button
input
divider
spacer
```

### 2.3 Type, ID and configuration are different concepts

```text
TYPE          reusable behavior/layout capability
ID            unique instance identity inside one screen document
PROPERTIES    runtime configuration of that behavior
```

Example:

```json
{
  "id": "login_header",
  "type": "stack_component",
  "properties": {
    "orientation": "vertical"
  }
}
```

`login_header` is screen-specific. `stack_component` is reusable. `vertical` is configuration, not another type.

---

## 3. Canonical hierarchy

Template and Component are mandatory. Section and Group are optional. Element is always terminal.

Only these paths are legal:

```text
Template → Component → Element
Template → Component → Section → Element
Template → Component → Section → Group → Element
```

The following are illegal:

```text
Template → Element
Template → Section
Component → Group
Component → Element + Section simultaneously
Section → Element + Group simultaneously
Group → Group
Group → Section
Element → Element
Element → any structural child
```

### Structural invariants

1. A Template MUST contain at least one Component.
2. A Component MUST contain exactly one branch: `elements[]` OR `sections[]`.
3. A Section MUST contain exactly one branch: `elements[]` OR `groups[]`.
4. A Group MUST contain `elements[]` only.
5. Element MUST never contain structural children.
6. Structural IDs MUST be unique inside a screen.
7. `template.id` MUST equal root `templateId`.
8. `template.type` MUST equal root `templateType`.
9. Runtime target scope remains `GLOBAL | PARTNER | CUSTOMER`.

---

## 4. Meaning of every hierarchy level

### 4.1 Template

**Role:** root layout policy for one screen document.

A Template answers questions such as:

- how are top-level Components arranged?
- what is the screen-level orientation?
- what outer padding applies?
- does content fill available width/height?
- what alignment/arrangement policy applies between Components?

It does not own authentication, navigation business rules, persistence or screen-specific backend logic.

Initial generic behavior:

```text
stack_template
```

A stack template can be vertical or horizontal through configuration. We do not create `vertical_template` and `horizontal_template`.

### 4.2 Component

**Role:** mandatory reusable composition boundary directly under Template.

Create another Component when there is a genuine top-level layout/composition boundary. Do not create Components merely because content has a different semantic label such as "branding", "form" or "legal".

Initial generic behavior:

```text
stack_component
```

### 4.3 Section

**Role:** optional internal layout boundary inside a Component.

Section is used when a Component needs a nested layout policy or when the legal hierarchy requires a transition from a Component into Groups.

Initial generic behavior:

```text
stack_section
```

A Section is not mandatory merely for consistency.

### 4.4 Group

**Role:** final optional structural container for a local arrangement of Elements.

A Group is useful for local Row/Column-like compositions such as:

```text
+91 | phone-number-input
```

Initial generic behavior:

```text
stack_group
```

Group may contain Elements only.

### 4.5 Element

**Role:** terminal visual/interactive leaf.

Examples:

```text
text
image
icon
button
input
divider
spacer
```

Elements may carry configuration, actions, analytics, accessibility, validation, binding, visibility and metadata where the canonical contract permits them, but never structural child nodes.

---

## 5. Stack layout model and Compose semantics

`stack_*` represents one generic sequential layout behavior. `orientation` determines whether it behaves conceptually like Compose `Column` or `Row`.

### 5.1 Vertical stack

```json
{
  "orientation": "vertical",
  "verticalArrangement": {
    "type": "spacedBy",
    "spacing": 24
  },
  "horizontalAlignment": "center"
}
```

Conceptual Compose equivalent:

```kotlin
Column(
    verticalArrangement = Arrangement.spacedBy(24.dp),
    horizontalAlignment = Alignment.CenterHorizontally
)
```

### 5.2 Horizontal stack

```json
{
  "orientation": "horizontal",
  "horizontalArrangement": {
    "type": "spacedBy",
    "spacing": 12
  },
  "verticalAlignment": "center"
}
```

Conceptual Compose equivalent:

```kotlin
Row(
    horizontalArrangement = Arrangement.spacedBy(12.dp),
    verticalAlignment = Alignment.CenterVertically
)
```

### 5.3 Parent versus child responsibility

**Parent container owns relationships between siblings:**

```text
orientation
horizontalArrangement
verticalArrangement
horizontalAlignment
verticalAlignment
spacing through arrangement
container padding
```

**Child owns its own measurement/appearance:**

```text
width
height
minWidth / maxWidth
minHeight / maxHeight
fillMaxWidth
fillMaxHeight
fillMaxSize
weight
aspectRatio
offset
background
border
shape
alpha
zIndex
optional scoped alignment override
```

Rule:

> Parent determines how children are normally arranged and aligned. A child describes itself and overrides parent alignment only when the design genuinely requires it.

Avoid introducing CSS-style `margin` as a foundational primitive. Prefer parent arrangement, padding, Spacer, weight, size constraints and offset because these map more naturally to Compose layout behavior.

### 5.4 Alignment is not size

For:

```text
+91 | 98765 43210
```

we may have:

```text
country code   wrap/natural width
separator      fixed thickness/height
phone input    weight = 1
```

Whether these children are top/center/bottom aligned is a separate concern from their widths.

---

## 6. Generic leading and trailing accessories

### 6.1 Requirement

A leaf may visually need content immediately before or after its primary content:

```text
──── PARTNER ────
+91 |
Continue →
₹ 499
🔍 Search
Search ×
```

Creating dedicated properties such as `leadingIcon`, `trailingDivider`, `prefixText`, `suffixImage`, `countryCode`, etc. would cause uncontrolled contract growth.

The generic vocabulary is therefore:

```text
leading[]
trailing[]
```

### 6.2 Accessories are not structural Elements

An accessory is a lightweight value object carried by an Element's properties. It MUST NOT become a normal hierarchy Element.

This distinction preserves:

```text
Element = terminal leaf
```

Conceptually:

```text
Element
├── primary content
├── leading[]   # accessory values
└── trailing[]  # accessory values
```

not:

```text
Element
└── child Element   # forbidden
```

### 6.3 Initial accessory vocabulary

The first supported accessory capabilities are intended to be:

```text
text
icon
image
divider
```

Each accessory contains a `type` and type-appropriate properties. It does not get structural children.

Example:

```json
{
  "type": "divider",
  "properties": {
    "orientation": "vertical",
    "height": 24,
    "thickness": 1,
    "color": "#D4DEE1"
  }
}
```

### 6.4 `PARTNER` example

```json
{
  "id": "brand_partner",
  "type": "text",
  "properties": {
    "text": "PARTNER",
    "leading": [
      {
        "type": "divider",
        "properties": {
          "orientation": "horizontal",
          "width": 36,
          "thickness": 2,
          "color": "#13B8B5"
        }
      }
    ],
    "trailing": [
      {
        "type": "divider",
        "properties": {
          "orientation": "horizontal",
          "width": 36,
          "thickness": 2,
          "color": "#13B8B5"
        }
      }
    ]
  }
}
```

### 6.5 Phone field example and ownership rule

The country code and editable phone number are separate Elements. The divider visually extends the country-code Element, so it is its trailing accessory.

```text
stack_group
├── text: +91
│   └── trailing accessory: vertical divider
└── input: phone number
```

Correct conceptual JSON:

```json
{
  "id": "mobile_number_group",
  "type": "stack_group",
  "properties": {
    "orientation": "horizontal",
    "verticalAlignment": "center",
    "horizontalArrangement": {
      "type": "spacedBy",
      "spacing": 12
    },
    "fillMaxWidth": true,
    "height": 56,
    "padding": {
      "start": 16,
      "end": 16
    },
    "background": {
      "color": "#FFFFFF"
    },
    "border": {
      "width": 1,
      "color": "#CCE0E3"
    },
    "shape": {
      "type": "roundedCorner",
      "cornerRadius": 16
    }
  },
  "elements": [
    {
      "id": "country_code",
      "type": "text",
      "properties": {
        "text": "+91",
        "fontSize": 18,
        "fontWeight": 600,
        "color": "#101522",
        "trailing": [
          {
            "type": "divider",
            "properties": {
              "orientation": "vertical",
              "height": 24,
              "thickness": 1,
              "color": "#D4DEE1"
            }
          }
        ]
      }
    },
    {
      "id": "mobile_number",
      "type": "input",
      "properties": {
        "fieldId": "mobileNumber",
        "placeholder": "98765 43210",
        "keyboardType": "phone",
        "maxLength": 10,
        "required": true,
        "weight": 1
      }
    }
  ]
}
```

Rule:

> Attach a leading/trailing accessory to the Element whose visual content it actually extends. Do not use leading/trailing to hide a real sibling layout relationship.

---

## 7. Theme and appearance

Theme remains screen-level configuration.

Back navigation MUST NOT be controlled by Theme. If a future screen has a Header component with a back action, that behavior belongs to the Header/component contract.

Target shape:

```json
{
  "theme": "light",
  "statusBar": "transparent",
  "properties": {
    "background": {
      "type": "linearGradient",
      "angle": 135,
      "colors": [
        { "color": "#DDF8F6", "stop": 0.0 },
        { "color": "#F7FEFD", "stop": 0.28 },
        { "color": "#FFFFFF", "stop": 0.55 },
        { "color": "#D9F7F4", "stop": 1.0 }
      ]
    }
  }
}
```

Colors use direct `#RRGGBB` values in runtime documents. No CarBroz-specific symbolic color token is required by this contract.

---

## 8. Initial generic production vocabulary

### Templates

```text
stack_template
```

### Components

```text
stack_component
```

### Sections

```text
stack_section
```

### Groups

```text
stack_group
```

### Elements

```text
text
image
icon
button
input
divider
spacer
```

This is an initial vocabulary, not a claim that every future layout is a stack. Future genuinely different reusable behaviors such as grid, overlay or carousel may be introduced through the same definition-extension mechanism when a real screen requires them.

---

## 9. Proposed contract/property organization

The existing structural schemas remain the authority for hierarchy. The implementation should add typed reusable property schemas rather than continuing to place every new layout concept directly into an unvalidated `Record<string, unknown>`.

Proposed organization:

```text
sdui/ui-sdk/src/
├── contract/
│   ├── common.schema.ts
│   ├── screen.schema.ts
│   ├── template.schema.ts
│   ├── component.schema.ts
│   ├── section.schema.ts
│   ├── group.schema.ts
│   └── element.schema.ts
│
├── properties/
│   ├── layout/
│   │   ├── orientation.schema.ts
│   │   ├── arrangement.schema.ts
│   │   ├── alignment.schema.ts
│   │   ├── spacing.schema.ts
│   │   ├── size.schema.ts
│   │   └── stack-properties.schema.ts
│   ├── appearance/
│   │   ├── color.schema.ts
│   │   ├── background.schema.ts
│   │   ├── border.schema.ts
│   │   └── shape.schema.ts
│   ├── accessory/
│   │   └── accessory.schema.ts
│   └── index.ts
│
├── definitions/
│   ├── templates/
│   ├── components/
│   ├── sections/
│   ├── groups/
│   ├── elements/
│   └── production-definitions.ts
│
├── registry/
├── builder/
├── factory/
├── validator/
├── serializer/
├── versioning/
└── public/
```

Do not create empty ceremonial folders. This structure is a target organization; create an artifact only when its implementation is required and tested.

---

## 10. Proposed artifact responsibilities and call relationships

The exact file split may be adjusted during source-first implementation if an existing artifact already owns the responsibility. No duplicate authority may be introduced.

### 10.1 `orientation.schema.ts`

**Owner:** `sdui/ui-sdk` generic property contract.

**Job:** validate the stack axis (`vertical | horizontal`).

**Called by:** stack property schema and any future generic layout definition that legitimately uses orientation.

**May depend on:** Zod only/shared UI SDK contract primitives.

**Must not know:** Login, Partner, Compose runtime classes, registry persistence.

### 10.2 `arrangement.schema.ts`

**Owner:** `sdui/ui-sdk`.

**Job:** model parent distribution along the main axis, including fixed arrangements and `spacedBy` with explicit spacing.

**Called by:** stack property validation.

**Why separate:** arrangement is a reusable value concept and must not be duplicated in Template/Component/Section/Group definitions.

### 10.3 `alignment.schema.ts`

**Owner:** `sdui/ui-sdk`.

**Job:** validate cross-axis alignment vocabulary and any approved scoped child alignment override.

**Called by:** stack properties and approved child sizing/layout properties.

**Must not:** infer alignment from screen semantics.

### 10.4 `spacing.schema.ts`

**Owner:** `sdui/ui-sdk`.

**Job:** validate edge padding and reusable spacing values.

**Called by:** stack/layout property contracts and appearance contracts where appropriate.

**Must not:** introduce CSS margin semantics as the default layout model.

### 10.5 `size.schema.ts`

**Owner:** `sdui/ui-sdk`.

**Job:** validate generic measurement behavior: width/height constraints, fill behavior, weight and aspect ratio where applicable.

**Called by:** generic structural and leaf property contracts.

**Why:** measurement is independent of parent alignment.

### 10.6 `color.schema.ts`

**Owner:** `sdui/ui-sdk` appearance vocabulary.

**Job:** validate runtime color format, initially direct `#RRGGBB` values.

**Called by:** text, border, background, divider, icon and other appearance contracts.

### 10.7 `background.schema.ts`

**Owner:** `sdui/ui-sdk` appearance vocabulary.

**Job:** validate solid/approved gradient background descriptions.

**Called by:** Theme and generic nodes that support backgrounds.

**Must not:** contain CarBroz screen-specific gradients as defaults.

### 10.8 `border.schema.ts`

**Owner:** `sdui/ui-sdk`.

**Job:** validate generic border width/color configuration.

### 10.9 `shape.schema.ts`

**Owner:** `sdui/ui-sdk`.

**Job:** validate generic shape data such as rounded corners.

### 10.10 `accessory.schema.ts`

**Owner:** `sdui/ui-sdk` leaf-property vocabulary.

**Job:** validate lightweight ordered leading/trailing accessory values.

**Initial accessory types:** text, icon, image, divider.

**Called by:** leaf property schemas that support leading/trailing presentation.

**Critical invariant:** accessories are values, not structural Elements. This schema must never create an `Element -> Element` hierarchy.

### 10.11 `stack-properties.schema.ts`

**Owner:** `sdui/ui-sdk` layout vocabulary.

**Job:** compose orientation, arrangement, alignment, spacing, size and approved appearance primitives into one reusable Stack property contract.

**Called by:** `stack_template`, `stack_component`, `stack_section`, `stack_group` definition registration/validation.

**Why:** one behavior contract prevents four drifting copies.

### 10.12 `stack_template` definition

**Owner:** `sdui/ui-sdk/src/definitions/templates`.

**Job:** instantiate the reusable root Stack behavior and enforce Template → Component.

**Called by:** UI SDK factory/builder/registry definition mechanism when composing a Template instance.

**Must not:** know `partner_login`.

### 10.13 `stack_component` definition

**Owner:** `sdui/ui-sdk/src/definitions/components`.

**Job:** instantiate Stack behavior at Component level while preserving the existing XOR branch invariant: Elements OR Sections.

### 10.14 `stack_section` definition

**Owner:** `sdui/ui-sdk/src/definitions/sections`.

**Job:** instantiate Stack behavior at Section level while preserving Elements OR Groups.

### 10.15 `stack_group` definition

**Owner:** `sdui/ui-sdk/src/definitions/groups`.

**Job:** instantiate Stack behavior at Group level while preserving Group → Element only.

### 10.16 `divider` Element definition

**Owner:** `sdui/ui-sdk/src/definitions/elements`.

**Job:** add a generic terminal divider capability supporting horizontal/vertical orientation, thickness, color and legal size properties.

**Called by:** ordinary Element composition and accessory composition.

**Must not:** become phone-specific.

### 10.17 Existing production definition bootstrap

**Owner:** `sdui/ui-sdk/src/definitions/production-definitions.ts`.

**Job after migration:** register all approved generic Template, Component, Section, Group and Element definitions exactly once/idempotently.

**Called by:** existing UI SDK production bootstrap/import lifecycle.

**Must not:** seed `partner_login` or other screen data.

### 10.18 Structural schemas

Existing Template/Component/Section/Group/Element schemas continue to own structural legality. Property typing is an evolution inside the same SDK, not a replacement hierarchy.

### 10.19 Screen schema / Theme

The screen contract continues to own root fields, target scope, Template ID/type consistency and structural duplicate-ID validation. Theme evolution belongs here or in a reusable Theme property schema consumed here.

`showBackButton` is planned for removal from the canonical Theme contract because navigation UI belongs to a Header/component, not Theme. This is a migration and must be checked against existing published documents/tests before removal.

### 10.20 SDUI Registry package

**Owner:** `sdui/registry`.

**Job:** persistence, draft/publish/archive/version lifecycle and published-screen retrieval.

**Called by:** application/API composition through its existing public boundary.

**Depends on:** the public/validated UI SDK contract as already permitted by architecture.

**Must not:** redefine stack properties, Element types or structural schemas.

### 10.21 Partner Login runtime document

**Owner:** runtime SDUI content managed through Registry publication.

**Job:** configure generic definitions into the Partner Login screen.

**Must not be stored as:** a new generic SDK type/class.

---

## 11. Definition registration flow

Target conceptual flow:

```text
Application bootstrap/import
        ↓
registerProductionSduiDefinitions()
        ↓
register Element definitions
        ↓
register Group definitions
        ↓
register Section definitions
        ↓
register Component definitions
        ↓
register Template definitions
        ↓
Definition registries contain canonical reusable vocabulary
```

Registration remains idempotent.

When a runtime document references:

```json
{ "type": "stack_group" }
```

the existing definition/factory/builder mechanism resolves that generic type. Screen-specific code is not selected.

---

## 12. Runtime screen lifecycle

The runtime lifecycle remains conceptually:

```text
Admin/content authoring
        ↓
DRAFT screen document
        ↓
UI SDK contract validation
        ↓
Registry persistence/versioning
        ↓
PUBLISH
        ↓
Published screen selected by screenId + targetApp
        ↓
Stored layout JSON parsed again through canonical UI SDK schema
        ↓
Validated SDUI screen returned through API boundary
```

Publishing must never allow invalid hierarchy/property data to become trusted runtime content.

---

## 13. Action boundary

SDUI describes an action; it does not own the business behavior executed by that action.

Conceptually:

```json
{
  "actions": {
    "onClick": {
      "type": "request",
      "payload": {
        "method": "POST",
        "endpoint": "/api/v1/partner/auth_login"
      }
    }
  }
}
```

The generic UI SDK may validate the action description. Authentication behavior remains owned by the Identity/Auth bounded context. The final action payload and endpoint must be verified against the actual auth contract before the Login document is published.

Do not create authentication logic inside SDUI definitions.

---

## 14. Partner Login proving composition

The Login screen is the first production proof of the generic language, not the owner of the language.

Target structure:

```text
partner_login
└── stack_template
    ├── stack_component
    │   ├── image: brand logo
    │   ├── text: CarBroz
    │   ├── text: PARTNER
    │   │   ├── leading accessory: horizontal divider
    │   │   └── trailing accessory: horizontal divider
    │   ├── text: tagline
    │   ├── text: Welcome Partner!
    │   └── text: Login to continue your journey
    │
    ├── stack_component
    │   └── stack_section(s)
    │       ├── stack_group: mobile field container
    │       │   ├── text: +91
    │       │   │   └── trailing accessory: vertical divider
    │       │   └── input: mobile number (weight 1)
    │       ├── button: Continue
    │       │   └── trailing accessory: arrow icon
    │       └── text: Terms / Privacy rich text
    │
    └── stack_component
        └── image: car hero
```

The exact number of Sections must follow legal hierarchy and genuine layout boundaries. Do not add structural nodes only to make the tree visually symmetrical.

---

## 15. Partner Login contract draft

The following is a **design draft**, not yet guaranteed to parse against the current production schema. It intentionally uses target vocabulary that implementation will add/validate. Asset URLs, legal URLs, schema version and final auth action payload remain integration values to resolve before publication.

```json
{
  "screenId": "partner_login",
  "templateId": "partner_login_template",
  "templateType": "stack_template",
  "schemaVersion": "1.0",
  "targetApp": "PARTNER",
  "theme": {
    "theme": "light",
    "statusBar": "transparent",
    "properties": {
      "background": {
        "type": "linearGradient",
        "angle": 135,
        "colors": [
          { "color": "#DDF8F6", "stop": 0.0 },
          { "color": "#F7FEFD", "stop": 0.28 },
          { "color": "#FFFFFF", "stop": 0.55 },
          { "color": "#D9F7F4", "stop": 1.0 }
        ]
      }
    }
  },
  "template": {
    "id": "partner_login_template",
    "type": "stack_template",
    "properties": {
      "orientation": "vertical",
      "verticalArrangement": {
        "type": "spacedBy",
        "spacing": 24
      },
      "horizontalAlignment": "center",
      "fillMaxSize": true,
      "padding": {
        "start": 24,
        "top": 20,
        "end": 24,
        "bottom": 20
      }
    },
    "components": [
      {
        "id": "login_header",
        "type": "stack_component",
        "properties": {
          "orientation": "vertical",
          "verticalArrangement": {
            "type": "spacedBy",
            "spacing": 6
          },
          "horizontalAlignment": "center",
          "fillMaxWidth": true
        },
        "elements": [
          {
            "id": "brand_logo",
            "type": "image",
            "properties": {
              "url": "<brand-logo-url>",
              "width": 120,
              "height": 96,
              "contentScale": "fit"
            }
          },
          {
            "id": "brand_name",
            "type": "text",
            "properties": {
              "fontSize": 44,
              "fontWeight": 700,
              "textAlign": "center",
              "spans": [
                { "text": "Car", "color": "#101522" },
                { "text": "Broz", "color": "#13B8B5" }
              ]
            }
          },
          {
            "id": "brand_partner",
            "type": "text",
            "properties": {
              "text": "PARTNER",
              "fontSize": 18,
              "fontWeight": 600,
              "letterSpacing": 4,
              "color": "#13B8B5",
              "textAlign": "center",
              "leading": [
                {
                  "type": "divider",
                  "properties": {
                    "orientation": "horizontal",
                    "width": 36,
                    "thickness": 2,
                    "color": "#13B8B5"
                  }
                }
              ],
              "trailing": [
                {
                  "type": "divider",
                  "properties": {
                    "orientation": "horizontal",
                    "width": 36,
                    "thickness": 2,
                    "color": "#13B8B5"
                  }
                }
              ]
            }
          },
          {
            "id": "brand_tagline",
            "type": "text",
            "properties": {
              "text": "Premium Car Care At Your Doorstep",
              "fontSize": 14,
              "fontWeight": 400,
              "color": "#6B7078",
              "textAlign": "center"
            }
          },
          {
            "id": "welcome_title",
            "type": "text",
            "properties": {
              "fontSize": 32,
              "fontWeight": 700,
              "textAlign": "center",
              "spans": [
                { "text": "Welcome ", "color": "#101522" },
                { "text": "Partner!", "color": "#13B8B5" }
              ]
            }
          },
          {
            "id": "welcome_subtitle",
            "type": "text",
            "properties": {
              "text": "Login to continue your journey",
              "fontSize": 16,
              "fontWeight": 400,
              "color": "#6B7078",
              "textAlign": "center"
            }
          }
        ]
      },
      {
        "id": "login_content",
        "type": "stack_component",
        "properties": {
          "orientation": "vertical",
          "verticalArrangement": {
            "type": "spacedBy",
            "spacing": 14
          },
          "horizontalAlignment": "center",
          "fillMaxWidth": true
        },
        "sections": [
          {
            "id": "mobile_number_section",
            "type": "stack_section",
            "properties": {
              "orientation": "vertical",
              "fillMaxWidth": true
            },
            "groups": [
              {
                "id": "mobile_number_group",
                "type": "stack_group",
                "properties": {
                  "orientation": "horizontal",
                  "verticalAlignment": "center",
                  "horizontalArrangement": {
                    "type": "spacedBy",
                    "spacing": 12
                  },
                  "fillMaxWidth": true,
                  "height": 56,
                  "padding": {
                    "start": 16,
                    "end": 16
                  },
                  "background": {
                    "color": "#FFFFFF"
                  },
                  "border": {
                    "width": 1,
                    "color": "#CCE0E3"
                  },
                  "shape": {
                    "type": "roundedCorner",
                    "cornerRadius": 16
                  }
                },
                "elements": [
                  {
                    "id": "country_code",
                    "type": "text",
                    "properties": {
                      "text": "+91",
                      "fontSize": 18,
                      "fontWeight": 600,
                      "color": "#101522",
                      "trailing": [
                        {
                          "type": "divider",
                          "properties": {
                            "orientation": "vertical",
                            "height": 24,
                            "thickness": 1,
                            "color": "#D4DEE1"
                          }
                        }
                      ]
                    }
                  },
                  {
                    "id": "mobile_number",
                    "type": "input",
                    "properties": {
                      "fieldId": "mobileNumber",
                      "placeholder": "98765 43210",
                      "keyboardType": "phone",
                      "maxLength": 10,
                      "required": true,
                      "weight": 1
                    },
                    "validation": {
                      "pattern": "^[6-9][0-9]{9}$",
                      "message": "Enter a valid 10-digit mobile number"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "login_action_section",
            "type": "stack_section",
            "properties": {
              "orientation": "vertical",
              "verticalArrangement": {
                "type": "spacedBy",
                "spacing": 12
              },
              "horizontalAlignment": "center",
              "fillMaxWidth": true
            },
            "elements": [
              {
                "id": "continue_button",
                "type": "button",
                "properties": {
                  "text": "Continue",
                  "fillMaxWidth": true,
                  "height": 56,
                  "shape": {
                    "type": "roundedCorner",
                    "cornerRadius": 16
                  },
                  "fontSize": 18,
                  "fontWeight": 600,
                  "textColor": "#FFFFFF",
                  "background": {
                    "type": "linearGradient",
                    "angle": 90,
                    "colors": [
                      { "color": "#28CBC7", "stop": 0.0 },
                      { "color": "#10B6B3", "stop": 1.0 }
                    ]
                  },
                  "trailing": [
                    {
                      "type": "icon",
                      "properties": {
                        "name": "arrow_forward",
                        "size": 22,
                        "color": "#FFFFFF"
                      }
                    }
                  ]
                },
                "actions": {
                  "onClick": {
                    "type": "request",
                    "payload": {
                      "method": "POST",
                      "endpoint": "/api/v1/partner/auth_login",
                      "authentication": "NONE",
                      "validateForm": true
                    }
                  }
                }
              },
              {
                "id": "legal_text",
                "type": "text",
                "properties": {
                  "fillMaxWidth": true,
                  "fontSize": 13,
                  "fontWeight": 400,
                  "lineHeight": 19,
                  "textAlign": "center",
                  "spans": [
                    {
                      "text": "By continuing, you agree to our ",
                      "color": "#6B7078"
                    },
                    {
                      "text": "Terms & Conditions",
                      "color": "#13B8B5",
                      "textDecoration": "underline",
                      "actionId": "terms"
                    },
                    {
                      "text": " and ",
                      "color": "#6B7078"
                    },
                    {
                      "text": "Privacy Policy",
                      "color": "#13B8B5",
                      "textDecoration": "underline",
                      "actionId": "privacy"
                    }
                  ]
                },
                "actions": {
                  "terms": {
                    "type": "openUrl",
                    "payload": {
                      "url": "<terms-url>"
                    }
                  },
                  "privacy": {
                    "type": "openUrl",
                    "payload": {
                      "url": "<privacy-policy-url>"
                    }
                  }
                }
              }
            ]
          }
        ]
      },
      {
        "id": "login_hero",
        "type": "stack_component",
        "properties": {
          "orientation": "vertical",
          "horizontalAlignment": "center",
          "fillMaxWidth": true
        },
        "elements": [
          {
            "id": "login_car",
            "type": "image",
            "properties": {
              "url": "<car-image-url>",
              "fillMaxWidth": true,
              "maxWidth": 420,
              "contentScale": "fit"
            }
          }
        ]
      }
    ]
  }
}
```

---

## 16. Migration strategy for existing production vocabulary

Current production vocabulary may already include definitions such as `default_template`, `form_template`, `content_component`, `form_component`, `content_section`, `row_group` and `column_group`.

The implementation MUST first discover whether any persisted/published runtime screen, test, seed or consumer still references these types.

Then choose one of two safe paths:

### Path A — no live dependency

If source and persistence evidence prove the old types are not consumed, replace them with the stack vocabulary and update tests atomically.

### Path B — compatibility required

If published/runtime data still references old types, do not break retrieval. Introduce stack definitions, define an explicit compatibility/deprecation period, migrate persisted documents, prove migration, then remove legacy definitions in a later controlled change.

Never leave duplicate vocabularies indefinitely without an explicit compatibility reason.

---

## 17. Implementation phases

### Phase 0 — source and persistence impact audit

Before editing:

1. re-fetch `development` and record HEAD;
2. inspect current UI SDK contracts, registries, factories, builders, validators, serializers and tests;
3. inspect Registry public lifecycle and persistence model;
4. search all source/tests/seeds for old production type usage;
5. determine whether published data requires compatibility;
6. inspect the real Identity/Auth action contract before freezing Login action payload;
7. inspect schema-version policy before freezing `schemaVersion`;
8. document any discovered conflict before changing code.

No frontend inspection is required for this backend contract phase unless separately authorized.

### Phase 1 — generic property vocabulary

Implement and test reusable property schemas for:

- orientation;
- arrangement;
- alignment;
- spacing/padding;
- size/weight/fill constraints;
- color;
- background/gradient;
- border;
- shape;
- accessory.

Do not bind these contracts to Login or Partner.

### Phase 2 — Stack definitions

Introduce `stack_template`, `stack_component`, `stack_section`, `stack_group` through the existing definition registries.

Preserve all hierarchy invariants.

### Phase 3 — leaf capability evolution

Add generic `divider` Element and typed properties required by Text/Image/Input/Button/Divider/Spacer.

Add ordered `leading[]` / `trailing[]` accessory support where valid.

### Phase 4 — Theme evolution

Add typed background/gradient support to Theme. Audit and remove/deprecate `showBackButton` only after compatibility proof.

### Phase 5 — production definition migration

Update canonical production definition registration. Migrate old definition names according to the Phase 0 result; do not silently break persisted documents.

### Phase 6 — Partner Login composition

Create the actual runtime document through the Registry lifecycle, using only generic production types. Resolve real asset URLs, legal URLs, schema version and auth action contract.

### Phase 7 — runtime/API integration proof

Prove:

```text
published PARTNER partner_login
        ↓
registry retrieval with targetApp=PARTNER
        ↓
canonical parse/validation
        ↓
expected serialized SDUI document
```

Also verify that Partner retrieval cannot silently default to CUSTOMER.

### Phase 8 — freeze verification

Run focused tests, package tests/typecheck/lint/build as available, architecture gates and finally the repository freeze command.

No "complete" claim is permitted until all applicable gates pass.

---

## 18. Required test matrix

### Structural positive tests

- Stack Template accepts one or more Components.
- Stack Component accepts direct Elements.
- Stack Component accepts Sections.
- Stack Section accepts direct Elements.
- Stack Section accepts Groups.
- Stack Group accepts Elements.
- Partner Login draft parses once all target contracts are implemented.

### Structural negative tests

- Template without Component fails.
- Component with both Elements and Sections fails.
- Empty Component fails.
- Section with both Elements and Groups fails.
- Empty Section fails.
- Empty Group fails.
- Group containing structural children is impossible/rejected.
- Element structural children are impossible/rejected.
- duplicate structural IDs fail.
- Template root ID mismatch fails.
- Template root type mismatch fails.

### Layout property tests

- valid vertical/horizontal orientation passes;
- unknown orientation fails;
- valid main-axis arrangements pass;
- `spacedBy` requires valid spacing;
- invalid alignment fails;
- invalid negative/unsupported measurement values fail where prohibited;
- weight contract is validated;
- padding contract is validated.

### Appearance tests

- valid `#RRGGBB` color passes;
- malformed color fails;
- valid solid background passes;
- valid linear gradient passes;
- invalid gradient stops/shape fail according to frozen schema;
- border/shape contracts reject malformed values.

### Accessory tests

- Text can carry valid divider leading/trailing accessories when its property schema allows them;
- Button can carry a trailing icon accessory;
- accessory ordering is preserved;
- unsupported accessory type fails;
- accessory cannot contain structural children;
- nested accessory recursion is rejected;
- accessory does not participate as a structural Element ID.

### Divider tests

- horizontal divider passes;
- vertical divider passes;
- invalid orientation fails;
- invalid thickness/color fails.

### Theme tests

- light/dark values pass;
- transparent/default status bar passes;
- approved gradient background passes;
- back-button UI is not part of the final Theme contract after compatibility migration.

### Target and registry tests

- `PARTNER` Login publication/retrieval succeeds;
- `CUSTOMER` does not accidentally resolve Partner Login;
- `ADMIN` is rejected as an SDUI rendering target;
- invalid draft cannot publish;
- published JSON is parsed through the canonical UI SDK before return;
- historical/published compatibility is proved if legacy definitions are retained temporarily.

### Regression tests

Permanent regression coverage must protect every production defect discovered during implementation, especially target-app defaulting, hierarchy bypasses and legacy definition migration.

---

## 19. Verification commands

Exact focused commands MUST be updated after Phase 0 discovers the final test files. Documentation must not invent file names that do not exist yet.

At minimum the completed implementation documentation must provide:

```text
pnpm exec vitest run <each SDUI focused test file>
pnpm --filter <ui-sdk-package-name> test
pnpm --filter <ui-sdk-package-name> typecheck
pnpm --filter <ui-sdk-package-name> lint
pnpm --filter <ui-sdk-package-name> build
pnpm test:freeze
```

Only commands that actually exist in workspace scripts may remain in the final implementation closeout.

---

## 20. Change rules during implementation

1. Re-fetch the branch before any write.
2. Never overwrite unrelated local changes.
3. Change the smallest existing owner that legitimately owns the behavior.
4. Do not create a new abstraction when an existing registry/factory/validator already owns the responsibility.
5. Do not move business logic into SDUI.
6. Do not make UI SDK depend on Registry persistence.
7. Do not put Partner/Customer screen semantics into generic definitions.
8. Do not weaken strict schemas merely to make Login JSON pass.
9. Do not retain `Record<string, unknown>` as the only validation for newly frozen critical layout concepts if typed validation can be introduced without breaking architecture.
10. Do not add Section/Group/Component nodes for visual symmetry; add them only for legal hierarchy or real layout boundaries.
11. Do not use leading/trailing accessories to conceal a real sibling relationship.
12. Do not represent accessories as structural Element children.
13. Do not claim migration safety without checking persisted/published usage.
14. Every fixed production bug receives a permanent regression test.
15. Update this document if implementation evidence changes the approved design.

---

## 21. Extension model after this work

A future screen should normally require only a new runtime document.

Example:

```text
new screen
   ↓
Can existing generic definitions express it?
   ├── yes → compose and publish runtime document; engine unchanged
   └── no  → identify genuinely new reusable behavior
              ↓
            add one generic definition/property contract + tests
              ↓
            register through existing extension mechanism
              ↓
            compose screen
```

Do not add a new type simply because a new screen exists.

Potential future behaviors such as `grid_*`, `overlay_*` or `carousel_*` are added only when their layout semantics are genuinely different from Stack and a production requirement proves the need.

---

## 22. Decisions frozen by this document

Unless later architecture evidence requires an explicit amendment:

- canonical hierarchy remains Template → Component → optional Section → optional Group → Element;
- Template and Component are mandatory;
- Element is terminal;
- initial general layout behavior is Stack;
- orientation is configuration, not a vertical/horizontal type split;
- Stack vocabulary is `stack_template`, `stack_component`, `stack_section`, `stack_group`;
- parent owns sibling arrangement/alignment;
- child owns its measurement and appearance;
- `weight` is independent of alignment;
- direct hex colors are used by runtime documents;
- Theme owns visual screen theme/background/status-bar policy, not back navigation;
- image content uses URL-based runtime configuration;
- `divider` is a generic leaf capability;
- `leading[]` and `trailing[]` are ordered generic accessory values;
- accessories are not structural Elements;
- country code and phone input remain separate Elements inside a horizontal Group;
- the country-code divider is a trailing accessory of the country-code Text;
- the outer phone-field background/border/shape belongs to the Group containing country code and Input;
- Login does not introduce Login-specific SDK classes;
- UI SDK owns the generic language;
- Registry owns runtime publication/version/retrieval;
- business actions remain owned by their bounded contexts;
- implementation begins only after source-first impact analysis and explicit approval.

---

## 23. Open items that implementation must resolve from source

These are deliberately not guessed in this design document:

1. exact production `schemaVersion` to use for Partner Login;
2. final authentication action type/payload and whether `/api/v1/partner/auth_login` is the actual action endpoint;
3. real logo/car image URLs and hosting policy;
4. Terms & Conditions and Privacy Policy URLs;
5. whether old production SDUI definition names have persisted/published consumers and therefore require compatibility migration;
6. exact typed-property integration point that causes the least disruption to the existing structural schemas/registries;
7. exact focused test file names and workspace commands after implementation artifacts exist;
8. whether current Registry/API target-app defaulting requires a regression fix as part of Partner Login publication.

These items must be resolved by repository/persistence evidence before production publication.

---

## 24. Definition of done

This SDUI evolution is complete only when all of the following are true:

- this design remains consistent with the Master Constitution;
- generic property contracts are implemented once and reused;
- Stack definitions are registered through existing registries;
- structural hierarchy invariants remain enforced;
- divider and accessory capabilities are generic and validated;
- no Element-child hierarchy was introduced;
- Theme no longer owns back-button UI after any required compatibility migration;
- old definition compatibility/migration is explicitly resolved;
- Partner Login is stored/published as runtime Registry content rather than SDK code;
- the real Auth boundary is used rather than invented SDUI business logic;
- Partner target retrieval is proven and cannot silently resolve CUSTOMER content;
- positive, negative and regression tests pass;
- package validation passes;
- architecture/freeze validation passes;
- documentation and TSDoc are updated to the implemented state;
- no unrelated architecture or local changes are overwritten.

Until those conditions are satisfied, the implementation remains in progress.
