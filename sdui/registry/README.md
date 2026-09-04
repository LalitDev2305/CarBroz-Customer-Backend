# @carbroz/sdui-registry

`@carbroz/sdui-registry` is the SDUI **lifecycle and persistence** package for CarBroz Backend V3.

## Why this package exists

`@carbroz/ui-sdk` defines the canonical product-neutral SDUI language and composition rules. This package consumes those contracts and manages the lifecycle of persisted SDUI assets.

Its responsibilities include, as implemented/evolved:

- persisted screen/template/component/section/group/element records that wrap canonical `@carbroz/ui-sdk` payloads;
- draft/publication state;
- target application/scope;
- immutable published versions;
- checksums/version history;
- persistence/repository behavior;
- rollback and administrative lifecycle capabilities.

## Important naming distinction

This workspace package is **not** the same thing as `sdui/ui-sdk/src/registry/DefinitionRegistry.ts`.

```text
ui-sdk/src/registry
  -> in-memory type -> reusable definition factory

sdui/registry
  -> persisted SDUI lifecycle/version/publication subsystem
```

Both may legitimately use the word "registry", but their responsibilities must never overlap.

## Dependency direction

```text
@carbroz/ui-sdk
      ^
      |
@carbroz/sdui-registry
```

This package may depend on `@carbroz/ui-sdk`. `@carbroz/ui-sdk` must never depend on this lifecycle package.

## Structural ownership rule

Entities such as `SduiTemplateEntity` may store lifecycle/persistence metadata together with a canonical `SduiTemplate` payload from `@carbroz/ui-sdk`. They must **not** redefine an alternative Template/Component/Section/Group/Element schema or composition hierarchy.

If a structural rule belongs to SDUI composition, validation, factories, builders or serialization, its owner is `@carbroz/ui-sdk`.

If a rule belongs to draft/publish/version/scope/persistence/history/rollback, its owner is `@carbroz/sdui-registry`.

## What this package must never own

- a second SDUI structural schema;
- Partner/Customer screen rendering rules;
- Booking, Pricing, Payment, KYC or other business-domain logic;
- Fastify transport/controllers;
- vendor/provider implementations unrelated to SDUI persistence lifecycle.

## Callers

The API Admin surface and application composition may invoke lifecycle capabilities exposed through this package's supported public/application boundary. Client-facing Partner/Customer transport should consume published outputs rather than mutate persistence internals directly.

## Testing expectations

Lifecycle tests must cover applicable publication/version immutability, scope isolation, persistence mapping, checksum/history behavior, rollback, invalid state transitions and compatibility with canonical `@carbroz/ui-sdk` contracts.
