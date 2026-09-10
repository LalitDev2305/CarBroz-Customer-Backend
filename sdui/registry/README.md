# SDUI Registry (`sdui/registry/`) — Persisted Lifecycle Boundary

> **Status:** ACTIVE / KEEP for the current focused freeze. It is not a second SDUI language or screen-authoring framework.
>
> **Canonical architecture:** [`../SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`](../SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md)

The standalone SDUI Registry is retained because current production/API behavior still requires persisted screen-document lifecycle and version resolution. Canonical node meaning, composition, properties, actions, definitions and validation belong only to `sdui/engine`.

## Current architectural decision

```text
KEEP sdui/registry
```

The package has concrete current consumers and persistence responsibilities:

- authenticated Partner Dashboard published-screen retrieval through `GET /api/v1/partner/sdui/registry/partner_dashboard`;
- authenticated Admin SDUI lifecycle routes for draft creation/update, publish, archive, version history, compare and rollback;
- persisted SDUI screen/version records used by those lifecycle operations.

Partner Login, Partner OTP and Configuration bootstrap do **not** use this package for screen composition. Login and OTP are code-composed by the canonical engine; Configuration owns destination metadata only.

## Final ownership boundary

```text
sdui/engine
  → canonical SDUI model
  → hierarchy
  → node definitions
  → property defaults + fluent authoring
  → generic actions/references
  → canonical validator
  → ScreenRegistry
  → dynamic screen composition

sdui/registry
  → persisted draft/version/publish/archive/retrieve lifecycle only
  → persisted published-version resolution
  → history/compare/rollback lifecycle where currently exposed
```

The registry must never redefine canonical meanings for:

```text
stack_template
form_template
default_template
stack_component
stack_section
stack_group
text
image
input
button
...
```

## Persisted lifecycle responsibilities

The retained production lifecycle is:

```text
CREATE draft
UPDATE draft
VALIDATE draft through the canonical engine validator
PUBLISH version
ARCHIVE version
RETRIEVE published version
VERSION HISTORY
COMPARE versions
ROLLBACK where supported
```

Those operations consume the same canonical engine contracts.

## Validation boundary

```text
canonical SduiScreen from engine or persisted draft
        ↓
engine canonical validator
        ↓
registry lifecycle rule validation
        ↓
persist / publish / retrieve
        ↓
engine canonical validation on hydration
```

The registry must not create a separate hierarchy/property/action validator.

## Compatibility catalogue APIs

Historical Component/Section/Group/Element catalogue entities or endpoints may remain only while concrete callers or persisted data require them.

They are not a second reusable definition registry. Canonical production reusable node types must not be redefined through runtime catalogue registration.

Their later retirement requires explicit caller and persisted-data migration proof; YAGNI does not justify adding new catalogue behavior.

## Screen ownership

Business/product screen composition must not live in this package.

Final screen composers live under:

```text
sdui/engine/src/screens/partner/
sdui/engine/src/screens/customer/
sdui/engine/src/screens/admin/
```

Adding a new code-composed product screen is:

```text
create ScreenComposer
+ register once in engine ScreenRegistry
```

No registry-specific screen builder is required.

## Dashboard runtime responsibility

The authenticated Partner Dashboard currently uses:

```text
GET /api/v1/partner/sdui/registry/partner_dashboard
```

The route resolves the current persisted published version. This is lifecycle/version resolution, not screen-language ownership.

The existence of this route does not grant the registry authority to define a second SDUI schema or authoring model. Persisted publication/retrieval consumes and validates against the engine contract.

## Runtime flow

```text
API request
  ↓
SduiService / engine ScreenRegistry when code-composed
  OR persisted registry lookup when lifecycle-backed
  ↓
canonical engine model
  ↓
canonical engine validation
  ↓
API serialization
```

Both paths produce the same canonical SDUI protocol.

## Retirement condition

The current decision is KEEP, not “keep just in case.” Registry capabilities may be removed or moved only after all of the following become true:

- current production routes no longer require persisted lifecycle/version resolution;
- active persisted versions have an explicit migration/retirement strategy;
- Admin publication/history/compare/rollback requirements are deliberately retired or replaced;
- no concrete callers rely on compatibility catalogue APIs;
- Prisma persistence that exists only for retired lifecycle behavior is safely migrated/removed;
- build, lint, tests and architecture/freeze gates remain green after the change.

Do not delete lifecycle behavior simply to achieve a single physical package. The architectural requirement is one canonical SDUI language/composition/validation authority, while persisted lifecycle remains a separate responsibility only for as long as concrete current product behavior requires it.
