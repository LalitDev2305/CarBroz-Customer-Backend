# CarBroz SDUI Dynamic Composition Architecture & Implementation Guide

> **Status:** DESIGN FREEZE CANDIDATE — documentation first. Production implementation begins only after explicit approval.
>
> **Authority:** Subordinate to `docs/MASTER-BACKEND-CONSTITUTION.md`, `docs/PRODUCTION_FREEZE_CONSTITUTION.md`, and `docs/ENGINEERING-DOCUMENTATION-STANDARD.md`. If a conflict exists, the higher authority wins and this guide must be corrected before code changes.
>
> **Scope:** Purely generic Server-Driven UI composition. No product screen, feature, business flow, or application-specific UI is defined here.

---

## 1. Purpose

This is the canonical implementation guide for building and evolving CarBroz dynamic UI.

A developer should be able to read this document and quickly answer:

- What is a Screen?
- What is a Template?
- What is a Component?
- When should a Section be used?
- When should a Group be used?
- What is an Element?
- How do these levels stack together?
- Which hierarchy combinations are legal?
- How do vertical and horizontal layouts work?
- Where do alignment, arrangement, size, padding, weight, background, border and shape belong?
- How do leading and trailing visual accessories work?
- How is a complete dynamic JSON document composed?
- How is the JSON validated, registered, persisted, published and retrieved?
- How is a new Template, Component, Section, Group or Element type added?
- How is an existing definition updated, deprecated or removed safely?
- Which backend class/module owns each responsibility?
- Which class calls which class and why?
- What tests are required before a contract change is accepted?

The objective is a **small generic UI language that can express many screens through configuration without creating screen-specific backend classes**.

---

# 2. Architecture in one minute

```text
                         ┌──────────────────────────┐
                         │          SCREEN          │
                         │ identity + target + theme│
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │         TEMPLATE         │
                         │ root composition policy  │
                         └────────────┬─────────────┘
                                      │
                           one or more Components
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │        COMPONENT         │
                         │ mandatory layout boundary│
                         └────────────┬─────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                 Elements                            Sections
                                                        │
                                         ┌──────────────┴──────────────┐
                                         │                             │
                                      Elements                       Groups
                                                                        │
                                                                     Elements
```

Only three structural paths are legal:

```text
Screen → Template → Component → Element
Screen → Template → Component → Section → Element
Screen → Template → Component → Section → Group → Element
```

Template and Component are mandatory.
Section and Group are optional.
Element is always terminal.

---

# 3. Package ownership

```text
sdui/
├── ui-sdk/
│   ├── contract/       # structural JSON contracts
│   ├── properties/     # reusable property/value contracts
│   ├── definitions/    # legal reusable UI type definitions
│   ├── registry/       # in-memory definition registries
│   ├── builder/        # safe programmatic composition
│   ├── factory/        # definition-driven construction
│   ├── validator/      # validation orchestration
│   ├── serializer/     # trusted serialization boundary
│   ├── versioning/     # schema compatibility policy
│   └── public/         # supported external SDK surface
│
└── registry/
    └── runtime persistence, draft/publish/archive/version/retrieval
```

## Ownership rule

```text
ui-sdk
    owns the LANGUAGE

sdui/registry
    owns runtime DOCUMENT LIFECYCLE

business domains
    own BUSINESS BEHAVIOR

API/application composition
    exposes the published document
```

No second SDUI engine may be created.
No feature-specific SDK hierarchy may be created.
No business behavior belongs inside generic UI definitions.

---

# 4. Core vocabulary: ID, Type and Properties

Every structural node separates three concerns:

```text
id          instance identity

type        reusable behavior definition

properties  configuration of that behavior
```

Example:

```json
{
  "id": "primary_content",
  "type": "stack_component",
  "properties": {
    "orientation": "vertical"
  }
}
```

Interpretation:

```text
primary_content     = this particular instance
stack_component     = reusable behavior
vertical            = runtime configuration
```

Never create `vertical_component` and `horizontal_component` when one Stack behavior plus `orientation` expresses both.

---

# 5. Screen

Screen is the root runtime document. It identifies what is being requested and contains exactly one Template.

Conceptual shape:

```json
{
  "screenId": "sample_screen",
  "templateId": "sample_template",
  "templateType": "stack_template",
  "schemaVersion": "<version>",
  "targetApp": "PARTNER",
  "theme": {},
  "template": {}
}
```

## Screen responsibilities

Screen owns:

- screen identity;
- template identity/type reference;
- schema version;
- rendering target scope;
- optional theme;
- optional metadata;
- one Template document.

Screen does not own:

- business use cases;
- persistence implementation;
- renderer implementation;
- domain logic.

## Screen invariants

```text
template.id   == templateId
template.type == templateType
all structural IDs are unique within the screen
```

---

# 6. Template

Template is the root composition policy inside a Screen.

```text
Screen
  └── Template
        ├── Component
        ├── Component
        └── Component
```

A Template answers:

- how top-level Components are arranged;
- which reusable root behavior is used;
- orientation;
- root alignment/arrangement;
- outer padding;
- root measurement behavior;
- root appearance where allowed.

Initial generic type:

```text
stack_template
```

Example:

```json
{
  "id": "sample_template",
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
  "components": []
}
```

A Template MUST contain at least one Component.

---

# 7. Component

Component is the mandatory composition boundary directly below Template.

```text
Template
  └── Component
```

Initial generic type:

```text
stack_component
```

A Component may choose exactly one branch:

```text
Component → elements[]
```

or:

```text
Component → sections[]
```

Never both.

## When to create another Component

Create a new Component when a genuine top-level composition/layout boundary exists.

Do not split Components simply because content has different semantic meaning.

Good reason:

```text
Component A requires vertical layout
Component B requires independent horizontal/root measurement behavior
```

Bad reason:

```text
these labels describe different business concepts
```

---

# 8. Section

Section is an optional internal composition boundary inside Component.

```text
Template
  └── Component
        └── Section
```

Initial generic type:

```text
stack_section
```

A Section may choose exactly one branch:

```text
Section → elements[]
```

or:

```text
Section → groups[]
```

Never both.

## When Section is useful

Use Section when:

- part of a Component requires another shared layout policy;
- the hierarchy needs Groups beneath the Component;
- multiple child items should share a nested arrangement/alignment/container policy.

Do not add Section merely to make every JSON tree have the same depth.

---

# 9. Group

Group is the final optional structural container before Elements.

```text
Template
  └── Component
        └── Section
              └── Group
                    ├── Element
                    └── Element
```

Initial generic type:

```text
stack_group
```

Group contains Elements only.

Use Group for a local composition of leaf items that must share another layout policy.

Example:

```text
horizontal Group
├── icon
├── text
└── button
```

Group must not contain another Group, Section or Component.

---

# 10. Element

Element is the terminal visual or interactive leaf.

Initial generic vocabulary:

```text
text
image
icon
button
input
divider
spacer
```

Conceptually:

```text
Element
├── id
├── type
├── properties
├── optional actions
├── optional validation
├── optional accessibility
├── optional binding
└── optional metadata
```

Element MUST NOT contain structural children.

```text
Element → Element       ❌
Element → Group         ❌
Element → Section       ❌
```

New leaf behavior should be introduced as a new Element definition only when existing generic Elements cannot express it cleanly.

---

# 11. Legal and illegal hierarchy diagrams

## Legal A — direct Elements

```text
Screen
└── Template
    └── Component
        ├── Element
        ├── Element
        └── Element
```

## Legal B — Sections

```text
Screen
└── Template
    └── Component
        ├── Section
        │   ├── Element
        │   └── Element
        └── Section
            └── Element
```

## Legal C — Sections and Groups

```text
Screen
└── Template
    └── Component
        ├── Section
        │   └── Group
        │       ├── Element
        │       └── Element
        └── Section
            └── Group
                ├── Element
                └── Element
```

## Illegal examples

```text
Template → Element                         ❌
Template → Section                         ❌
Component → Group                          ❌
Component → elements[] + sections[]        ❌
Section → elements[] + groups[]            ❌
Group → Group                              ❌
Group → Section                            ❌
Element → child structural node            ❌
```

---

# 12. Stack behavior

Stack is the initial generic sequential layout primitive.

The hierarchy level tells us *where* it operates:

```text
stack_template
stack_component
stack_section
stack_group
```

The properties tell us *how* it lays out children.

## Vertical

```json
{
  "orientation": "vertical",
  "verticalArrangement": {
    "type": "spacedBy",
    "spacing": 16
  },
  "horizontalAlignment": "center"
}
```

Conceptual Compose mapping:

```kotlin
Column(
    verticalArrangement = Arrangement.spacedBy(16.dp),
    horizontalAlignment = Alignment.CenterHorizontally
)
```

## Horizontal

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

Conceptual Compose mapping:

```kotlin
Row(
    horizontalArrangement = Arrangement.spacedBy(12.dp),
    verticalAlignment = Alignment.CenterVertically
)
```

The backend contract uses Compose-inspired semantics because they clearly separate orientation, arrangement, alignment and measurement. The backend does not depend on Compose classes.

---

# 13. Parent and child property ownership

This rule prevents contradictory JSON.

## Parent owns sibling relationships

```text
orientation
horizontalArrangement
verticalArrangement
horizontalAlignment
verticalAlignment
container padding
```

## Child owns itself

```text
width
height
minWidth
maxWidth
minHeight
maxHeight
fillMaxWidth
fillMaxHeight
fillMaxSize
weight
aspectRatio
offset
alpha
zIndex
background
border
shape
clip
```

## Core rule

> Parent defines the default relationship between children. Child defines its own measurement and appearance. Child-specific alignment is used only when it intentionally overrides the parent policy.

Do not make CSS-style margin a foundational layout mechanism. Prefer parent arrangement, padding, Spacer, weight, constraints and offset.

---

# 14. Arrangement, alignment and size are independent

Three questions must remain separate:

```text
1. In which direction are children placed?
   → orientation

2. How are children distributed/aligned?
   → arrangement + alignment

3. How much space does each child consume?
   → width/height/fill/weight/constraints
```

Example:

```text
horizontal stack
├── child A: natural width
├── child B: fixed width
└── child C: weight 1
```

All three may still use:

```text
verticalAlignment = top | center | bottom
```

Different width does not imply different alignment.

---

# 15. Generic property families

The target contract should type important reusable properties instead of allowing every critical layout value to remain arbitrary JSON.

## Layout

```text
orientation
horizontalArrangement
verticalArrangement
horizontalAlignment
verticalAlignment
padding
width
height
minWidth
maxWidth
minHeight
maxHeight
fillMaxWidth
fillMaxHeight
fillMaxSize
weight
aspectRatio
offset
```

## Appearance

```text
background
border
shape
clip
alpha
zIndex
color
```

## Content-specific examples

```text
text
fontSize
fontWeight
letterSpacing
lineHeight
textAlign
url
contentScale
placeholder
keyboardType
maxLength
thickness
```

Properties must be validated by the definition/property contract that owns them. A node should not silently accept unrelated properties simply because they are JSON-compatible.

---

# 16. Leading and trailing accessories

Some leaf content needs small visual content immediately before or after its primary content.

Generic mechanism:

```text
leading[]
trailing[]
```

Initial accessory types:

```text
text
icon
image
divider
```

Accessories are ordered.

Example:

```json
{
  "id": "caption",
  "type": "text",
  "properties": {
    "text": "FEATURED",
    "leading": [
      {
        "type": "divider",
        "properties": {
          "orientation": "horizontal",
          "width": 32,
          "thickness": 1,
          "color": "#999999"
        }
      }
    ],
    "trailing": [
      {
        "type": "icon",
        "properties": {
          "name": "arrow_forward",
          "size": 16,
          "color": "#999999"
        }
      }
    ]
  }
}
```

## Accessory invariant

Accessory is a value object, **not a structural Element**.

```text
Text Element
├── primary text
├── leading[] accessory values
└── trailing[] accessory values
```

It does not create:

```text
Element
└── Element
```

Accessories must not have structural IDs, Sections, Groups or child Elements.

## When not to use an accessory

If two items are independent siblings with independent sizing/layout behavior, represent them as separate Elements inside a Group.

```text
Group
├── Element A
└── Element B
```

Do not hide a real sibling relationship inside `leading[]` or `trailing[]` merely to reduce JSON size.

---

# 17. Theme

Theme is optional screen-level visual configuration.

Conceptual generic example:

```json
{
  "theme": "light",
  "statusBar": "transparent",
  "properties": {
    "background": {
      "type": "linearGradient",
      "angle": 135,
      "colors": [
        { "color": "#EAF9F8", "stop": 0.0 },
        { "color": "#FFFFFF", "stop": 0.5 },
        { "color": "#E5F7F6", "stop": 1.0 }
      ]
    }
  }
}
```

Runtime colors use direct `#RRGGBB` values in this contract.

Theme owns screen visual policy. It must not become a container for unrelated component behavior or business/navigation behavior.

---

# 18. Complete generic JSON example

This example intentionally demonstrates all three legal branches without representing any real product screen.

```json
{
  "screenId": "sample_dynamic_screen",
  "templateId": "sample_dynamic_template",
  "templateType": "stack_template",
  "schemaVersion": "<version>",
  "targetApp": "PARTNER",
  "theme": {
    "theme": "light",
    "statusBar": "transparent",
    "properties": {
      "background": {
        "color": "#FFFFFF"
      }
    }
  },
  "template": {
    "id": "sample_dynamic_template",
    "type": "stack_template",
    "properties": {
      "orientation": "vertical",
      "verticalArrangement": {
        "type": "spacedBy",
        "spacing": 20
      },
      "horizontalAlignment": "center",
      "fillMaxSize": true,
      "padding": {
        "start": 24,
        "top": 24,
        "end": 24,
        "bottom": 24
      }
    },
    "components": [
      {
        "id": "direct_leaf_component",
        "type": "stack_component",
        "properties": {
          "orientation": "vertical",
          "verticalArrangement": {
            "type": "spacedBy",
            "spacing": 8
          },
          "horizontalAlignment": "center",
          "fillMaxWidth": true
        },
        "elements": [
          {
            "id": "sample_title",
            "type": "text",
            "properties": {
              "text": "Dynamic UI",
              "fontSize": 24,
              "fontWeight": 700,
              "color": "#111111",
              "textAlign": "center"
            }
          },
          {
            "id": "sample_image",
            "type": "image",
            "properties": {
              "url": "https://example.com/image.png",
              "width": 96,
              "height": 96,
              "contentScale": "fit"
            }
          }
        ]
      },
      {
        "id": "section_component",
        "type": "stack_component",
        "properties": {
          "orientation": "vertical",
          "fillMaxWidth": true
        },
        "sections": [
          {
            "id": "direct_leaf_section",
            "type": "stack_section",
            "properties": {
              "orientation": "vertical",
              "verticalArrangement": {
                "type": "spacedBy",
                "spacing": 12
              },
              "fillMaxWidth": true
            },
            "elements": [
              {
                "id": "sample_input",
                "type": "input",
                "properties": {
                  "fieldId": "sampleValue",
                  "placeholder": "Enter value",
                  "fillMaxWidth": true
                }
              },
              {
                "id": "sample_button",
                "type": "button",
                "properties": {
                  "text": "Continue",
                  "fillMaxWidth": true,
                  "trailing": [
                    {
                      "type": "icon",
                      "properties": {
                        "name": "arrow_forward",
                        "size": 18,
                        "color": "#FFFFFF"
                      }
                    }
                  ]
                }
              }
            ]
          },
          {
            "id": "group_section",
            "type": "stack_section",
            "properties": {
              "orientation": "vertical",
              "fillMaxWidth": true
            },
            "groups": [
              {
                "id": "sample_horizontal_group",
                "type": "stack_group",
                "properties": {
                  "orientation": "horizontal",
                  "horizontalArrangement": {
                    "type": "spacedBy",
                    "spacing": 12
                  },
                  "verticalAlignment": "center",
                  "fillMaxWidth": true
                },
                "elements": [
                  {
                    "id": "sample_icon",
                    "type": "icon",
                    "properties": {
                      "name": "info",
                      "size": 20,
                      "color": "#444444"
                    }
                  },
                  {
                    "id": "sample_description",
                    "type": "text",
                    "properties": {
                      "text": "Example grouped content",
                      "weight": 1,
                      "fontSize": 14,
                      "color": "#444444"
                    }
                  },
                  {
                    "id": "sample_divider",
                    "type": "divider",
                    "properties": {
                      "orientation": "vertical",
                      "height": 24,
                      "thickness": 1,
                      "color": "#DDDDDD"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

This example demonstrates:

```text
Template → Component → Element
Template → Component → Section → Element
Template → Component → Section → Group → Element
```

in one document while preserving the XOR rule at each branching level.

---

# 19. End-to-end lifecycle

```text
┌────────────────────────────┐
│ 1. Reusable type exists?   │
└──────────────┬─────────────┘
               │
        yes ───┴─── no
         │            │
         │            ▼
         │   Add generic definition
         │   + property contract
         │   + tests
         │            │
         └────────────┘
               │
               ▼
┌────────────────────────────┐
│ 2. Compose runtime JSON    │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│ 3. Structural validation  │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│ 4. Definition/property    │
│    validation             │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│ 5. Store as DRAFT         │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│ 6. Validate for publish   │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│ 7. PUBLISH version        │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│ 8. Runtime retrieval      │
│ screenId + targetApp      │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│ 9. Parse again through    │
│    canonical SDK schema   │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│10. Serialize trusted JSON │
└──────────────┬─────────────┘
               ▼
┌────────────────────────────┐
│11. Client interprets UI   │
└────────────────────────────┘
```

A persisted document is not trusted merely because it was valid when originally stored. Runtime retrieval must continue to respect canonical schema/version policy.

---

# 20. Definition registration flow

Reusable types are registered once through the existing definition system.

```text
registerProductionSduiDefinitions()
        │
        ├── register Element definitions
        │      text / image / icon / button / input / divider / spacer
        │
        ├── register Group definitions
        │      stack_group
        │
        ├── register Section definitions
        │      stack_section
        │
        ├── register Component definitions
        │      stack_component
        │
        └── register Template definitions
               stack_template
```

Registration must remain idempotent.

The production definition bootstrap registers reusable language only. It must not register runtime screen documents.

---

# 21. Proposed property contract classes/files

The exact split must be reconciled against existing source before implementation. Do not create a duplicate if an existing artifact already owns the responsibility.

Target organization:

```text
sdui/ui-sdk/src/properties/
├── layout/
│   ├── orientation.schema.ts
│   ├── arrangement.schema.ts
│   ├── alignment.schema.ts
│   ├── spacing.schema.ts
│   ├── size.schema.ts
│   └── stack-properties.schema.ts
│
├── appearance/
│   ├── color.schema.ts
│   ├── background.schema.ts
│   ├── border.schema.ts
│   └── shape.schema.ts
│
├── accessory/
│   └── accessory.schema.ts
│
└── index.ts
```

Do not create empty folders merely to match this diagram.

---

# 22. Class/file responsibility matrix

| Artifact | Owns | Called/consumed by | Must not own |
|---|---|---|---|
| `common.schema.ts` | shared primitive contract vocabulary | structural schemas/property schemas | feature behavior |
| `screen.schema.ts` | root Screen shape, root invariants, target/theme linkage | parser/validator/public contract | persistence |
| `template.schema.ts` | Template structural shape | screen schema, builders | runtime storage |
| `component.schema.ts` | Component shape and Elements XOR Sections | template schema/builders | Group direct ownership |
| `section.schema.ts` | Section shape and Elements XOR Groups | component schema/builders | business semantics |
| `group.schema.ts` | Group → Elements-only shape | section schema/builders | nested structural containers |
| `element.schema.ts` | terminal Element envelope | group/section/component schemas | structural children |
| `orientation.schema.ts` | vertical/horizontal axis | stack properties | screen-specific behavior |
| `arrangement.schema.ts` | main-axis distribution/spacedBy | stack properties | measurement |
| `alignment.schema.ts` | cross-axis alignment | stack properties/layout contracts | business meaning |
| `spacing.schema.ts` | padding/spacing value shapes | layout contracts | CSS layout model |
| `size.schema.ts` | width/height/fill/constraints/weight | structural and leaf property contracts | sibling arrangement |
| `color.schema.ts` | runtime color format | appearance/text/icon/divider contracts | theme business policy |
| `background.schema.ts` | solid/gradient background shape | Theme and supported nodes | hardcoded screen background |
| `border.schema.ts` | generic border shape | supported nodes | component semantics |
| `shape.schema.ts` | generic shape/corner configuration | supported nodes | renderer implementation |
| `accessory.schema.ts` | ordered lightweight leading/trailing values | supported leaf properties | structural Element hierarchy |
| `stack-properties.schema.ts` | reusable Stack property composition | all `stack_*` definitions | hierarchy ownership |
| Template definition registry | available Template behaviors | factory/builder/validation composition | runtime screens |
| Component definition registry | available Component behaviors | factory/builder/validation composition | runtime screens |
| Section definition registry | available Section behaviors | factory/builder/validation composition | runtime screens |
| Group definition registry | available Group behaviors | factory/builder/validation composition | runtime screens |
| Element definition registry | available terminal behaviors | factory/builder/validation composition | business logic |
| `production-definitions.ts` | canonical reusable production registration | SDK bootstrap | runtime document data |
| builder layer | safe programmatic construction | SDK consumers/factory as designed | persistence authority |
| factory layer | definition-driven creation | builder/composition boundary | business decisions |
| validator layer | orchestration of contract/definition validation | draft/publish/runtime boundaries | mutation of valid data |
| serializer layer | trusted output serialization | runtime/public boundary | validation bypass |
| versioning layer | compatibility/schema policy | parser/publish/runtime | screen semantics |
| `sdui/registry` | draft/publish/archive/version/persistence/retrieval | application/API boundary | definition language |

Every production class/function introduced during implementation must also receive TSDoc describing owner, role, callers, dependencies, non-responsibilities and invariants according to the engineering documentation standard.

---

# 23. Call relationship diagram

```text
                         UI SDK bootstrap
                               │
                               ▼
                  Production Definition Registrar
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
      Definition Registries  Property Schemas  Structural Schemas
             │                 │                 │
             └──────────┬──────┴──────────┬──────┘
                        │                 │
                        ▼                 ▼
                      Factory          Validator
                        │                 ▲
                        ▼                 │
                      Builder ────────────┘
                        │
                        ▼
                 Valid SDUI document
                        │
                        ▼
                  Runtime Registry
              draft/version/publish/store
                        │
                        ▼
                Retrieval application
                        │
                        ▼
                Canonical parse/validate
                        │
                        ▼
                    Serializer
                        │
                        ▼
                     API output
```

Actual source dependencies must follow the Master Constitution. This diagram describes responsibilities, not permission to introduce dependency cycles.

---

# 24. How to add a new Template type

Use this process only when an existing Template behavior cannot express the required root composition.

```text
Requirement
   ↓
Can stack_template express it using properties?
   ├── YES → do not create a new Template type
   └── NO
       ↓
Identify genuinely different reusable layout behavior
       ↓
Define typed properties
       ↓
Create Template definition
       ↓
Register through Template definition registry
       ↓
Add positive + negative tests
       ↓
Update public documentation
```

Example future categories might include genuinely different behaviors such as grid or overlay. They must not be added speculatively.

Checklist:

```text
[ ] reusable across more than one potential screen
[ ] cannot be represented by existing behavior + properties
[ ] generic name
[ ] no feature/business terminology
[ ] typed properties
[ ] legal Template → Component structure
[ ] registration test
[ ] validation tests
[ ] migration/version impact reviewed
[ ] documentation updated
```

---

# 25. How to add a new Component type

```text
Need new Component behavior
   ↓
Can stack_component + properties express it?
   ├── YES → configure existing type
   └── NO → define reusable Component behavior
               ↓
          property contract
               ↓
          definition registration
               ↓
          preserve Elements XOR Sections
               ↓
          tests + docs
```

Never create a Component type because one screen calls the area by a particular business name.

---

# 26. How to add a new Section type

A new Section type requires a genuinely new reusable nested composition behavior.

It must always preserve:

```text
Section → elements[]
OR
Section → groups[]
```

Never both.

The same source-first, typed-property, registration, test and documentation process applies.

---

# 27. How to add a new Group type

Group is a local Element container.

A new Group type must preserve:

```text
Group → elements[] only
```

If Stack plus orientation/arrangement/alignment can express the requirement, reuse `stack_group`.

Do not create `left_group`, `right_group`, `top_group`, `bottom_group`, `vertical_group`, or `horizontal_group` merely to encode configuration in a type name.

---

# 28. How to add a new Element type

Create a new Element only for a genuinely new terminal visual/interactive capability.

Process:

```text
Need leaf behavior
   ↓
Can existing Element + properties/accessories express it?
   ├── YES → reuse existing Element
   └── NO
       ↓
Define generic Element contract
       ↓
Define type-specific properties
       ↓
Register Element definition
       ↓
Prove terminal invariant
       ↓
Positive/negative tests
       ↓
Document renderer expectation without coupling backend to renderer
```

Element must never introduce structural children.

---

# 29. How to add or change a property

Properties are part of the public SDUI contract and must be treated as versioned API vocabulary.

## Additive compatible property

Typical safe path:

```text
new optional property
   ↓
add typed schema
   ↓
add to owning property contract
   ↓
register/compose through existing definition
   ↓
positive + negative tests
   ↓
compatibility review
   ↓
document
```

## Required property

Changing an optional property to required may break persisted documents and clients. Treat as a compatibility change, not a small refactor.

## Rename property

Do not simply rename in place if published documents may contain the old name.

```text
old property
   ↓
introduce new property/version policy
   ↓
compatibility/migration path
   ↓
migrate persisted documents
   ↓
prove old usage removed
   ↓
remove deprecated vocabulary later
```

## Delete property

Deletion requires proof that:

- no supported schema version needs it;
- no published/persisted document needs it;
- no public consumer depends on it;
- migration is complete;
- regression tests protect the new contract.

---

# 30. How to update an existing definition

A definition change may alter every runtime document using that type.

Required sequence:

```text
1. Search source references
2. Search tests/seeds/fixtures
3. Determine persisted/published usage
4. Classify change:
      additive compatible
      behavior-compatible
      breaking
5. Update typed contract
6. Update definition
7. Add/update focused tests
8. Validate representative documents
9. Run package verification
10. Run freeze verification
11. Update this guide/README/TSDoc
```

Never change a definition merely until one sample JSON passes.

---

# 31. How to deprecate or delete a definition

Deletion is a lifecycle operation.

```text
Definition marked for removal
          ↓
Find every source/test/runtime reference
          ↓
Any supported runtime document uses it?
   ├── YES → cannot remove
   │          migrate/version first
   └── NO
          ↓
Remove registration
          ↓
Remove implementation
          ↓
Keep regression proving unsupported type is rejected
          ↓
Run full verification
```

Do not leave old and new definitions indefinitely as duplicate authorities. Compatibility aliases require an explicit migration purpose and removal plan.

---

# 32. Runtime document CRUD versus definition CRUD

These are different operations and must never be confused.

## Runtime document lifecycle

Owned by `sdui/registry`:

```text
CREATE draft
UPDATE draft
VALIDATE draft
PUBLISH version
ARCHIVE version
RETRIEVE published version
```

A published immutable/versioned artifact should not be silently mutated in place; follow the Registry's version lifecycle.

## Definition lifecycle

Owned by `sdui/ui-sdk` code:

```text
ADD reusable definition
UPDATE definition with compatibility review
DEPRECATE definition
REMOVE definition after migration proof
```

Runtime admin operations must not dynamically redefine the meaning of core SDK types unless a separately approved architecture explicitly introduces that capability.

---

# 33. Validation layers

Validation should answer progressively deeper questions.

```text
Layer 1 — JSON/structural
Is the document shaped correctly?

Layer 2 — hierarchy
Are only legal parent/child relationships used?

Layer 3 — definition
Does each `type` exist at the correct hierarchy level?

Layer 4 — property
Are properties valid for that type?

Layer 5 — invariant
Are IDs unique? Do template ID/type match root references?

Layer 6 — version/target
Is the schema version supported and target valid?

Layer 7 — publication
Is this document safe to become a published runtime artifact?
```

Validation must reject invalid input; it should not silently reinterpret malformed contracts into a different UI.

---

# 34. Error philosophy

Errors should identify:

```text
WHAT failed
WHERE it failed
WHY it is invalid
WHICH invariant was violated
```

Useful conceptual error:

```text
component 'content_area': cannot contain both elements[] and sections[]
```

Poor error:

```text
invalid json
```

Do not expose sensitive implementation details through public API errors, but internal validation must remain diagnosable.

---

# 35. Versioning and compatibility

SDUI is a distributed contract. Backend and multiple client versions may coexist.

Therefore:

```text
schema change != local refactor
```

Every change must be classified:

```text
compatible additive
compatible behavioral
breaking structural
breaking semantic
```

Breaking changes require an explicit schema/version and migration strategy consistent with the existing versioning architecture.

Never guess a new `schemaVersion` merely because a file changed.

---

# 36. Initial implementation target

The first implementation phase should establish generic vocabulary only:

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

orientation
arrangement
alignment
spacing
size
background
border
shape
color
leading[]
trailing[]
```

No product-specific document is required to define these capabilities.

---

# 37. Existing vocabulary migration rule

If the current repository contains older generic definitions, implementation must first determine whether source, tests, fixtures, seeds or persisted/published documents still depend on them.

Two safe paths exist.

## No dependency

```text
prove unused
   ↓
replace atomically
   ↓
update tests/docs
```

## Compatibility required

```text
introduce new vocabulary
   ↓
retain explicit temporary compatibility
   ↓
migrate runtime documents
   ↓
prove migration
   ↓
remove legacy vocabulary in controlled change
```

Never maintain two equivalent vocabularies permanently without a real architectural reason.

---

# 38. Implementation phases

## Phase 0 — forensic source audit

Before editing production code:

- re-fetch `development` and record HEAD;
- inspect all current structural schemas;
- inspect definition registries;
- inspect factory/builder/validator/serializer/versioning;
- inspect runtime Registry lifecycle;
- discover all tests;
- discover all current production definitions;
- search old definition/property usage;
- determine compatibility requirements;
- identify existing owners before creating any new file.

## Phase 1 — typed property foundation

Implement reusable layout/appearance/accessory value contracts with focused tests.

## Phase 2 — Stack definitions

Implement/register `stack_template`, `stack_component`, `stack_section`, `stack_group` through existing registries.

## Phase 3 — generic Elements

Ensure initial Element definitions exist and add only missing generic capabilities such as Divider. Add typed properties and accessory support where valid.

## Phase 4 — Theme contract

Type generic Theme appearance properties and remove unrelated responsibilities only through compatibility-safe migration.

## Phase 5 — migration

Resolve legacy definition/property compatibility based on Phase 0 evidence.

## Phase 6 — Registry integration proof

Prove generic draft → validation → publish → retrieval → parse → serialization flow.

## Phase 7 — architecture and freeze proof

Run focused tests, package verification, architecture gates and final repository freeze command.

---

# 39. Required test matrix

## Hierarchy positive

```text
Template → Component → Element passes
Template → Component → Section → Element passes
Template → Component → Section → Group → Element passes
multiple Components pass
multiple Sections pass
multiple Groups pass
multiple Elements pass
```

## Hierarchy negative

```text
Template without Component fails
Template direct Element fails
Component with Elements + Sections fails
empty Component fails
Component direct Group fails
Section with Elements + Groups fails
empty Section fails
empty Group fails
Group nested Group fails
Element structural child fails
duplicate structural ID fails
template ID mismatch fails
template type mismatch fails
```

## Stack properties

```text
vertical orientation passes
horizontal orientation passes
unknown orientation fails
valid arrangements pass
invalid arrangement fails
spacedBy validates spacing
alignment values validate
weight validates
size constraints validate
padding validates
```

## Appearance

```text
valid #RRGGBB passes
malformed color fails
solid background passes
supported gradient passes
invalid gradient fails
border validates
shape validates
```

## Accessories

```text
leading text passes
leading icon passes
trailing image passes
trailing divider passes
multiple ordered accessories preserve order
unsupported accessory fails
accessory structural child fails
nested accessory recursion fails
accessory is not counted as structural node ID
```

## Definition registration

```text
all canonical definitions register
registration is idempotent
unknown type fails
wrong hierarchy-level type fails
removed/deprecated type follows version policy
```

## Registry lifecycle

```text
valid draft stores
invalid draft cannot publish
published version retrieves
retrieved layout parses through canonical SDK
archived/version behavior follows Registry policy
target scope remains isolated
```

Every production bug found during implementation receives a permanent regression test.

---

# 40. Verification requirements

Exact commands must be discovered from actual workspace scripts during implementation; do not invent unavailable commands.

Completed documentation must list focused commands in this form where they actually exist:

```text
pnpm exec vitest run <focused-test-file>
pnpm --filter <ui-sdk-workspace> test
pnpm --filter <ui-sdk-workspace> typecheck
pnpm --filter <ui-sdk-workspace> lint
pnpm --filter <ui-sdk-workspace> build
pnpm test:freeze
```

`pnpm test:freeze` remains the final repository-wide proof, but it does not replace focused tests.

---

# 41. Fast decision guide

```text
Need new UI?
   │
   ├─ Can existing JSON types express it?
   │      └─ YES → create/update runtime document only
   │
   └─ NO
       │
       ├─ New root layout behavior?      → Template definition
       ├─ New major container behavior?  → Component definition
       ├─ New nested container behavior? → Section definition
       ├─ New local leaf layout?         → Group definition
       └─ New terminal capability?       → Element definition

Before creating any type:
Can existing type + properties express it?
   ├─ YES → reuse it
   └─ NO  → add one generic reusable capability
```

---

# 42. Quick hierarchy selection guide

```text
Always need:
Screen → Template → Component

Need only leaf items in Component?
Component → Elements

Need another nested layout boundary?
Component → Sections → Elements

Need local grouping of leaf items inside Section?
Component → Sections → Groups → Elements
```

Do not choose hierarchy depth based on visual complexity alone. Choose it based on actual layout boundaries and legal composition.

---

# 43. Architecture rules for implementation

1. Source-first: inspect current owner before creating code.
2. One authority per responsibility.
3. UI SDK defines language; Registry owns runtime lifecycle.
4. Business domains own business behavior.
5. Template and Component are mandatory.
6. Section and Group are optional.
7. Element is terminal.
8. Component uses Elements XOR Sections.
9. Section uses Elements XOR Groups.
10. Group contains Elements only.
11. Orientation is configuration, not type proliferation.
12. Parent owns sibling layout relationships.
13. Child owns its measurement/appearance.
14. Accessories are values, not structural children.
15. Do not hide real sibling relationships inside accessories.
16. Add generic behavior only when existing behavior cannot express the requirement.
17. Treat property/type changes as versioned contract changes.
18. Do not delete vocabulary without runtime compatibility proof.
19. Do not weaken validation to make one JSON document pass.
20. Every important new class/function gets architectural TSDoc.
21. Every important behavior gets focused tests.
22. Every fixed defect gets a permanent regression test.
23. Update this guide when approved architecture changes.
24. Do not declare completion until focused and freeze validation pass.

---

# 44. Definition of done for the generic SDUI foundation

The foundation is complete only when:

```text
[ ] current source ownership has been audited
[ ] structural hierarchy remains constitution-compliant
[ ] typed reusable property contracts exist
[ ] Stack definitions are generic and registered once
[ ] generic Element vocabulary is validated
[ ] leading/trailing accessories preserve terminal Element invariant
[ ] Theme contains only appropriate screen visual policy
[ ] legacy vocabulary compatibility is explicitly resolved
[ ] definition registration is idempotent
[ ] draft/publish/retrieval flow is proven
[ ] runtime retrieval reparses through canonical contract
[ ] version/target behavior is proven
[ ] positive tests pass
[ ] negative tests pass
[ ] regression tests pass
[ ] package build/typecheck/lint/tests pass where configured
[ ] architecture gates pass
[ ] `pnpm test:freeze` passes
[ ] TSDoc and package documentation match implementation
[ ] no duplicate SDUI authority was introduced
```

---

# 45. Final mental model

Remember the system as five simple questions:

```text
SCREEN
What runtime UI document is this?

TEMPLATE
How are the major areas of the screen composed?

COMPONENT
What mandatory major layout boundaries exist?

SECTION / GROUP
Do we need additional nested/local layout boundaries?

ELEMENT
What terminal content is actually rendered or interacted with?
```

And remember the extension rule:

```text
CONFIGURE first
REUSE second
EXTEND only when necessary
VERSION when compatibility requires it
NEVER create screen-specific SDUI architecture
```

This document is the implementation blueprint for the generic CarBroz SDUI composition system. Production code must remain consistent with it and with the higher-level backend constitution.