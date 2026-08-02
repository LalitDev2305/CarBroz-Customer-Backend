---
Version: 1.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-02
---

# 04 Dynamic UI Specification

> [!CAUTION]
> The JSON contract structure is absolute and strictly enforced.

## Locked JSON Contract
The root hierarchy consists of EXACTLY the following keys:
- `screenId`: Unique identifier for the screen layout.
- `templateId`: Layout wrapper identifier.
- `templateType`: String defining layout bounds.
- `template`: Contains root `components`.
- `components`: High-level structural areas (Header, Body).
- `subcomponents`: Granular layouts within components (Rows, Columns).
- `children`: Structural nesting blocks.
- `childrenData`: Leaf atoms (Texts, Inputs, Images).
- `theme`: UI gradient and style overrides.

**NEVER change this hierarchy.** The JSON hierarchy is permanently locked. Only values may change. Hierarchy can never change. Customer, Partner, and Admin must all follow exactly the same hierarchy.

## Builder Rules & Screen Generation
- Utilize the `BaseScreenBuilder` class.
- Atom builders define text, buttons, and inputs. Modifiers control styling properties.
- Dynamic data must be hydrated at runtime by the backend state.

## Versioning & Theming
- Screens are tightly versioned against `appVersion`.
- Themes (Light/Dark) must be universally provided at the `template` root level, and children inherit unless strictly overridden.

## Localization Rules
- Texts must be backed by a `localization_key`.
- The engine dynamically maps keys to localized strings before JSON serialization, ensuring the client receives native text.
