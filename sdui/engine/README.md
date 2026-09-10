# @carbroz/sdui-engine

CarBroz's canonical backend Server-Driven UI engine.

## Status

**ACTIVE / CANONICAL.** The `ui-sdk` migration compatibility package has been retired. New SDUI language, definitions, composition, validation and screen ownership belong here only.

Architecture authority:

```text
sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md
sdui/README.md
docs/MASTER-BACKEND-CONSTITUTION.md
```

## Ownership

The engine owns:

```text
wire/model contracts
-> actions + value references
-> property scopes/defaults
-> reusable node definitions
-> NodeDefinitionRegistry
-> SduiBuilder
-> screen composers
-> ScreenRegistry
-> SduiService
-> canonical validation
-> SduiScreen output
```

Business domains do not own or import screen composition. API surfaces are HTTP adapters and consume the engine public facade rather than maintaining screen wrappers/builders.

The standalone `sdui/registry` workspace is separate: it may persist draft/publish/version/history/rollback lifecycle while concrete callers/data require it, but it is not a second SDUI language/definition/validator/composition authority.

## Public runtime flow

```text
productionSduiService.buildScreen({ targetApp, screenId, ...context })
  -> ScreenRegistry.get(targetApp, screenId)
  -> ScreenComposer.build(context)
  -> SduiValidator.validate(screen)
  -> canonical SduiScreen
```

Callers must not manually recreate this orchestration.

## Canonical hierarchy

```text
Screen -> Template -> Component -> Element
Screen -> Template -> Component -> Section -> Element
Screen -> Template -> Component -> Section -> Group -> Element
```

Permanent structural rules:

```text
Component -> Elements XOR Sections
Section   -> Elements XOR Groups
Group     -> Elements only
Element   -> no structural descendants
```

Template and Component are mandatory. Section and Group are optional according to the selected legal branch.

## Design rules

- one SDUI engine;
- one node-definition registry;
- one screen registry;
- one validator authority;
- one owner per concrete screen composer;
- explicit `(targetApp, screenId)` registration;
- no hidden mutable parent cursor;
- no parent-ID lookup composition;
- no builder class per reusable node type;
- node definitions co-locate type, property contract, defaults and child capability;
- screen instance overrides cannot mutate global defaults;
- unsupported properties/events fail closed;
- unknown node definitions fail closed;
- output is validated before leaving the engine.

## Partner Auth ownership

Canonical Partner auth screen composers are:

```text
src/screens/partner/PartnerLoginScreen.ts
src/screens/partner/PartnerOtpScreen.ts
```

Their external behavior is frozen by `sdui/PARTNER-AUTH-SDUI-CONTRACT.md`.

Authentication/OTP business rules belong to `domains/identity`; OTP persistence/provider implementation belongs behind Identity-owned ports. The engine only describes presentation and generic actions.

## Verification

From repository root:

```bash
pnpm --filter @carbroz/sdui-engine build
pnpm --filter @carbroz/sdui-engine test
pnpm --filter @carbroz/sdui-engine test:coverage
pnpm build
pnpm exec eslint --quiet .
pnpm test -- --run
```

The focused freeze additionally requires architecture gates, Login/OTP/Configuration integration tests and exact-SHA verification. Coverage must not be achieved by exclusions or threshold weakening.
