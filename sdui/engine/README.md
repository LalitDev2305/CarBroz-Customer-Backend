# @carbroz/sdui-engine

CarBroz's canonical backend Server-Driven UI engine.

## Status

This package is being implemented according to `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`, which is the frozen architecture contract for SDUI convergence.

During migration, `@carbroz/sdui-engine` may depend on stable wire-contract and validation behavior from the existing `@carbroz/ui-sdk`. That dependency is a temporary compatibility bridge; the old builder/factory/property architecture must not be extended through this package.

## Ownership

The engine owns the complete SDUI presentation lifecycle:

```text
vocabulary
  → composition
  → screen resolution
  → validation
  → canonical SduiScreen output
```

Business domains do not own or import SDUI screen composition. API surfaces are transport adapters and will ultimately call only the engine's public façade.

## Public runtime flow

```text
SduiService.buildScreen(...)
  ↓
ScreenRegistry.get(targetApp, screenId)
  ↓
ScreenComposer.build(context)
  ↓
SduiValidator.validate(screen)
  ↓
SduiScreen
```

`SduiService` is the intended application-facing entry point. Callers must not manually orchestrate the registry, composer, or validator.

## Design rules

- Composite represents the canonical SDUI hierarchy.
- A small nested Builder/Internal DSL constructs the hierarchy.
- `ScreenComposer` is the strategy contract for one application screen.
- `ScreenRegistry` provides exact `(targetApp, screenId)` ownership and lookup.
- Actions, themes, bindings, and shared values use typed values/helpers rather than builder hierarchies.
- Node definitions co-locate type identity, property contract, and child capability.
- There is one definition registry.
- No builder class is created per reusable node type.
- No hidden mutable parent cursor or parent-ID lookup is allowed.

## Canonical hierarchy

```text
Screen → Template → Component → Element
Screen → Template → Component → Section → Element
Screen → Template → Component → Section → Group → Element
```

Permanent XOR rules:

```text
Component → Elements XOR Sections
Section   → Elements XOR Groups
```

## Verification

From repository root:

```bash
pnpm install --frozen-lockfile
pnpm --filter @carbroz/sdui-engine build
pnpm --filter @carbroz/sdui-engine test
pnpm --filter @carbroz/sdui-engine test:coverage
pnpm build
pnpm lint
pnpm test
```

The full canonical CI and architecture gates must also pass before any migration phase is considered complete.
