# @carbroz/ui-sdk

`@carbroz/ui-sdk` is the single canonical, product-neutral Server-Driven UI language and composition toolkit for CarBroz Backend V3.

## Why this package exists

This package defines **how SDUI is described, composed, validated and serialized**. It is intentionally independent of Partner, Customer, Admin, Booking, Pricing and every other CarBroz business capability.

It does **not** own draft/publish/version persistence. That lifecycle belongs to `@carbroz/sdui-registry` in `sdui/registry`.

## Canonical hierarchy

Only these structural paths are valid:

```text
Template -> Component -> Element
Template -> Component -> Section -> Element
Template -> Component -> Section -> Group -> Element
```

Component and Element are mandatory levels. Section and Group are optional.

## Internal responsibilities

```text
src/
├── contract/      -> canonical structural/runtime contracts
├── definitions/   -> reusable product-neutral production vocabulary
├── registry/      -> in-memory definition registration by canonical type
├── factory/       -> create instances from registered definitions
├── builder/       -> compose complete runtime structures
├── validator/     -> enforce structural/runtime invariants
├── serializer/    -> deterministic wire representation
├── versioning/    -> schema-version compatibility rules
└── public/        -> supported package surface
```

## The internal `registry/` is not the SDUI lifecycle registry

`src/registry/DefinitionRegistry.ts` maps a canonical definition type to an immutable reusable factory, for example:

```text
button            -> Element definition factory
content_section   -> Section definition factory
form_template     -> Template definition factory
```

This is an internal composition mechanism.

The separate workspace package `sdui/registry` owns SDUI publication lifecycle concerns such as drafts, immutable published versions, target scope, persistence, checksums, history and rollback.

Dependency direction:

```text
@carbroz/ui-sdk
      ^
      |
@carbroz/sdui-registry
```

`ui-sdk` must never depend on `sdui-registry` or any CarBroz business bounded context.

## Extension model

The package follows Open/Closed Principle for production vocabulary.

Adding a new Template, Component, Section, Group or Element should normally require:

1. adding/declaring the reusable definition;
2. registering it in the matching definition registry/bootstrap;
3. adding positive and negative tests.

Unrelated existing definitions, factories, builders and consumers should remain unchanged.

Do not introduce screen-specific types such as `partner_login_template` merely because one screen needs different runtime data. Prefer generic reusable structural definitions and supply runtime properties/data through instances.

## What this package must never own

- Partner or Customer business rules;
- screen publication/version persistence;
- Admin workflows;
- Booking, Pricing, Payment or KYC behavior;
- provider/vendor SDKs;
- database repositories;
- Fastify transport/controllers;
- product-specific screen-name orchestration.

## Testing requirements

Tests must prove:

- all three legal hierarchy branches;
- illegal/empty/mixed branches fail;
- duplicate/unknown definitions fail safely;
- definition registration is deterministic;
- one reusable definition can create independent runtime instances;
- new definitions can be registered without modifying unrelated engine code;
- serialization/versioning contracts remain compatible.

See `docs/TESTING-EXTENSIBILITY-AND-PROVIDER-STANDARD.md` for the repository-wide testing rules.
