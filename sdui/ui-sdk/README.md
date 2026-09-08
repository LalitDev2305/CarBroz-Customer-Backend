# SDUI UI SDK (`sdui/ui-sdk/`)

Owns the generic, product-neutral SDUI schema, validation, composition, action/binding, and rendering-contract vocabulary exposed through `@carbroz/ui-sdk`. Registry lifecycle and business-specific screen composition are separate authorities.

## Canonical contracts

- Structural composition and implementation guide: `../SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`
- Frozen generic interaction language: [`ACTION-CONTRACT.md`](./ACTION-CONTRACT.md)

`ACTION-CONTRACT.md` is the package-local authority for generic actions, dynamic destinations, bindings/value references, presentation commands, controlled runtime-state mutation and action sequencing. Business behavior referenced by those contracts remains owned by its bounded context.
