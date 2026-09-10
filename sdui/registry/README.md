# SDUI Registry (`sdui/registry/`) — Persisted Lifecycle Compatibility Boundary

> **Status:** ACTIVE PERSISTENCE/LIFECYCLE CAPABILITY DURING MIGRATION. It is not a second SDUI language or screen-authoring framework.
>
> **Canonical architecture:** [`../SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`](../SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md)

The runtime SDUI Registry owns persisted screen-document lifecycle where that lifecycle is still required. Canonical node meaning, composition, properties, actions and validation converge to `sdui/engine`.

## Final ownership target

```text
sdui/engine
  → canonical SDUI model
  → hierarchy
  → node definitions
  → property defaults + fluent authoring
  → generic actions/references
  → canonical validator
  → dynamic screen composition

sdui/registry
  → persisted draft/version/publish/archive/retrieve lifecycle only
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

Where production still requires persisted SDUI documents, this package may own:

```text
CREATE draft
UPDATE draft
VALIDATE draft
PUBLISH version
ARCHIVE version
RETRIEVE published version
VERSION HISTORY
ROLLBACK where supported
```

Those operations must consume the same canonical engine contracts.

## Validation boundary

Target flow:

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

They are not a second reusable definition registry.

Canonical production reusable node types must not be redefined through runtime catalogue registration.

Retirement is allowed only after usage, persisted-version, migration, route and test proof shows removal is safe.

## Screen ownership

Business/product screen composition must not live in this package.

Final screen composers live under:

```text
sdui/engine/src/screens/partner/
sdui/engine/src/screens/customer/
sdui/engine/src/screens/admin/
```

Adding a new product screen is:

```text
create ScreenComposer
+ register once in ScreenRegistry
```

No registry-specific screen builder should be required.

## Dashboard compatibility

The authenticated Partner Dashboard currently uses the persisted registry route:

```text
GET /api/v1/partner/sdui/registry/partner_dashboard
```

This route and published-document lifecycle must remain behaviorally compatible during migration.

The existence of this route does not grant the registry authority to define a second SDUI schema or authoring model. Any code-authored Dashboard composition must converge into `sdui/engine`; persisted publication/retrieval consumes the engine contract.

## Runtime flow after convergence

```text
API request
  ↓
SduiService / ScreenRegistry when code-composed
  OR persisted registry lookup when lifecycle-backed
  ↓
canonical engine model
  ↓
canonical engine validation
  ↓
API serialization
```

Both paths must produce the same canonical SDUI protocol.

## Retirement/convergence condition

Registry sub-capabilities may be removed or folded into the engine only after:

- production routes and persisted versions are audited;
- migration strategy exists for active documents;
- publication/history requirements are preserved or deliberately retired;
- no callers rely on compatibility catalogue APIs;
- full build/lint/test/freeze checks pass.

Do not delete lifecycle behavior simply to achieve a single physical package. The architectural requirement is one canonical SDUI language and validation authority, not blind file consolidation.
