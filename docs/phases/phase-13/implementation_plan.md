# Phase 13 Implementation Plan: Streamlined SDUI Registry & Engine Relocation

## Objectives
1. **Part A - SDUI Engine Ownership Correction (`packages/ui-sdk`)**: Establish `@carbroz/ui-sdk` as the sole owner of the reusable SDUI engine (`ScreenFactory`, `BaseScreenBuilder`, `IScreenBuilder`, `JsonSerializer`, `ui.models.ts`, base components, sections, templates, and `UI` DSL helper).
2. **Part B - Clean Data Contract & Validation**: Support the locked 6-level JSON contract (`Screen` → `Template` → `Component` → `Subcomponent` → `Child` → `ChildrenData` + `Theme`) using clean TypeScript interfaces and level-by-level Zod schemas without introducing unnecessary factory or builder bloat.
3. **Part C - Database SDUI Registry**: Implement a database-backed SDUI layout registry (`SduiScreen`, `SduiTemplate`, `SduiComponentRegistry`) that resolves published layouts from DB first, validates them against Zod schemas, and falls back to static `ScreenFactory` builders.

---

## Architecture Validation & Pragmatic Principles

### 1. Fixed Document Hierarchy (Not Deep Object-Oriented Polymorphism)
The SDUI structure is a structural JSON document:
```
Screen
    └── Template
            └── Components[]
                    └── Subcomponents[]
                            └── Children[]
                                    └── ChildrenData[]
```
- **NO Recursive Tree**: No Component inside Component, Child inside Child, or ChildrenData inside ChildrenData.
- **NO Factory Bloat**: `ScreenFactory` is the **ONLY** factory required. We do NOT create `TemplateFactory`, `ComponentFactory`, `SubcomponentFactory`, `ChildFactory`, or `ChildrenDataFactory`.
- **NO Builder Bloat**: `BaseScreenBuilder` is the **ONLY** builder required. `UI.component()`, `UI.child()`, `BaseTemplate`, and `GenericComponent` act as fluent node construction helpers. We do NOT create separate builder classes for every level.

---

## Reusable Component Boundaries

### `@carbroz/ui-sdk` (Sole Engine Owner)
- **Models**: `IScreen`, `ITemplate`, `IComponent`, `ISubcomponent`, `IChild`, `IChildrenData`, `ITheme`, `UIProperties`, `UIAction`
- **Schemas**: `childrenDataSchema`, `childSchema`, `subcomponentSchema`, `componentSchema`, `templateSchema`, `themeSchema`, `screenSchema`
- **Factories**: `ScreenFactory` (Maps `screenId` → `IScreenBuilder`)
- **Builders**: `BaseScreenBuilder`, `IScreenBuilder`
- **Utilities**: `JsonSerializer`, `UI` DSL helper, `BaseTemplate`, `GenericComponent`, `BaseComponent`

### Feature Modules (`apps/backend-api/src/modules/*/ui/`)
- Concrete Screen Builders extending `BaseScreenBuilder`: `AuthLoginBuilder`, `AuthOtpBuilder`, `DashboardBuilder`.

---

## Database Registry Strategy

### Models (`packages/database/prisma/schema.prisma`)
- `SduiScreen`: Stores complete screen `layoutJson` (`screenId`, `targetApp`, `version`, `isPublished`).
- `SduiTemplate`: Stores reusable template layouts (`templateId`, `templateType`, `defaultLayoutJson`).
- `SduiComponentRegistry`: Unified component schema registry (`name`, `nodeLevel`, `componentType`, `schemaJson`, `supportedProperties`, `supportedActions`, `version`, `status`).

### Runtime Resolution Flow
```
GET /api/v1/sdui/registry/:screenId
   │
   ├── ISduiRegistryRepository.findPublishedScreen(screenId, targetApp)
   │     │
   │     ├── Published DB layout found?
   │     │     ├── YES → Validate screen JSON with Zod screenSchema → Return
   │     │     └── NO  → Fallback: ScreenFactory.buildScreen(screenId) → Validate with screenSchema → Return
```

---

## Summary of Planned Modifications

1. **Keep Unchanged**:
   - `@carbroz/ui-sdk` package structure and entry point.
   - `ScreenFactory`, `BaseScreenBuilder`, `IScreenBuilder`, `JsonSerializer`, `UI` DSL helper.
   - Feature module concrete screen builders (`AuthLoginBuilder`, `AuthOtpBuilder`, `DashboardBuilder`).
   - Clean Architecture layering (`@carbroz/common` entities/interfaces, `@carbroz/database` repositories, `sdui` Fastify routes).

2. **Improve**:
   - Refine `ui.models.ts` in `packages/ui-sdk` to export explicit type contracts: `ISubcomponent`, `IChild`, `IChildrenData`.
   - Add level-by-level Zod schemas (`childrenDataSchema` → `screenSchema`) in `packages/ui-sdk` for precise validation.
   - Update `SduiComponentRegistry` Prisma schema & domain entity with `nodeLevel` (`COMPONENT`, `SUBCOMPONENT`, `CHILD`, `CHILDREN_DATA`).

3. **Remove from Original Plan**:
   - **REMOVED**: `TemplateFactory`, `ComponentFactory`, `SubcomponentFactory`, `ChildFactory`, `ChildrenDataFactory` (Unnecessary factory proliferation).
   - **REMOVED**: `BaseTemplateBuilder`, `BaseComponentBuilder`, `BaseSubcomponentBuilder`, `BaseChildBuilder`, `BaseChildrenDataBuilder` (Unnecessary builder proliferation).

---

## Verification Plan

1. `pnpm prisma validate`
2. `pnpm prisma generate`
3. `pnpm build`
4. `pnpm lint`
5. `pnpm test`
