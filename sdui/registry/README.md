# SDUI Registry (`sdui/registry/`)

The runtime SDUI Registry is the authority for **screen-document lifecycle**, not for the reusable meaning of canonical `ui-sdk` definitions.

## Ownership boundary

`@carbroz/ui-sdk` owns reusable SDUI language and behavior:

- Template / Component / Section / Group / Element type meaning;
- definition-specific property contracts;
- typed Builders;
- canonical hierarchy;
- canonical validation and serialization.

`@carbroz/sdui-registry` owns runtime screen documents:

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

The Registry must not redefine what canonical production types such as `stack_component`, `stack_section`, `stack_group`, `text`, `input`, or `button` mean.

## Validation boundary

Registry screen-document operations consume the same canonical UI SDK validation path.

Draft create/update validates canonical screen structure. Publication uses publication-strength validation before activation. Published screens are validated again when hydrated/retrieved so persisted runtime documents cannot silently bypass the canonical contract.

The Registry must not introduce a separate hierarchy/property validator framework.

## Compatibility node catalogue APIs

Historical Registry APIs/entities for Component, Section, Group, and Element catalogue records remain only as a compatibility/admin boundary while existing callers and persisted data require them.

They are **not** a second reusable definition registry.

Creation paths are guarded through `assertRuntimeDefinitionMayBeRegistered(...)`, which prevents the runtime Registry from registering/redefining canonical production `ui-sdk` types.

These compatibility paths may be retired only after usage, migration, persisted-version, route, and test proof shows removal is safe. Until then, retaining them is an explicit compatibility decision rather than duplicate ownership.

## Runtime flow

```text
Owning domain/surface screen Builder
        ↓
Canonical SduiScreen
        ↓
UI SDK canonical validation
        ↓
Registry draft/version lifecycle
        ↓
Publication validation
        ↓
Published runtime document
        ↓
Retrieve + canonical validation
        ↓
API serialization/response
```

Business-specific screen composition and business policy remain outside the Registry.
