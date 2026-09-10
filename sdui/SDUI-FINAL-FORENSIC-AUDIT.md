# CarBroz SDUI Final Forensic Convergence Audit

> **HISTORICAL / SUPERSEDED IMPLEMENTATION EVIDENCE:** This audit records the earlier `ui-sdk` convergence state. It is not current implementation authority and MUST NOT be used to restore `ui-sdk`, `SduiScreenBuilder`, Partner wrapper builders, or the old action-contract path. Current authority is `sdui/README.md` -> `SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md` -> current Partner Auth contracts -> current source/gates.

> **Scope:** Final source-level audit for the SDUI composition convergence defined by `SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md` and `PHASE-A-SOURCE-RECONCILIATION.md`.
>
> **Freeze rule:** This document records source/test convergence. `COMPLETE + FROZEN` is valid only when Backend CI and Backend Architecture Closeout both complete successfully on the exact `development` SHA containing this audit.

## 1. Audit conclusion

The canonical production SDUI authoring path has converged on one `@carbroz/ui-sdk` object-graph Builder language:

```text
SduiScreenBuilder
  -> typed Template Builder
      -> typed Component Builder
          -> typed Element Builder
          OR typed Section Builder
              -> typed Element Builder
              OR typed Group Builder
                  -> typed Element Builder
```

Production Partner Login, OTP, and Dashboard screens use returned Builder references, typed method-name-defined node creation, typed Theme authoring, and typed Request/Body authoring where actions are required. The runtime Registry remains a screen-document lifecycle boundary and consumes the UI SDK's canonical validation/publication path.

No requirement reviewed below has an unexplained `FAIL`.

## 2. Requirement-to-source evidence matrix

| Requirement | Source owner | Implementation evidence | Test / verification evidence | Status |
|---|---|---|---|---|
| Canonical hierarchy is `Screen -> Template -> Component -> Element`, `... -> Section -> Element`, or `... -> Section -> Group -> Element` | `@carbroz/ui-sdk` | `sdui/ui-sdk/src/contract/*`, `src/builder/HierarchyBuilders.ts`, `src/builder/ElementParentBuilder.ts` | `sdui/ui-sdk/tests/screen.schema.test.ts`, `composition-engine.test.ts`, `canonical-authoring-builders.test.ts` | **PASS** |
| Component is Elements XOR Sections; Section is Elements XOR Groups | `@carbroz/ui-sdk` | hierarchy Builders and canonical schemas/validator | `composition-engine.test.ts`, `screen.schema.test.ts`, `layered-validator.test.ts` | **PASS** |
| Returned object reference defines ownership; no current-parent cursor or parent-ID composition | `@carbroz/ui-sdk` | `BaseSduiScreenBuilder.ts`, `HierarchyBuilders.ts`, `ElementParentBuilder.ts` | `canonical-authoring-builders.test.ts` proves siblings configured later/out of creation order retain correct ownership | **PASS** |
| Canonical production root is no-argument `SduiScreenBuilder` with fluent root configuration | `@carbroz/ui-sdk` | `sdui/ui-sdk/src/builder/SduiScreenBuilder.ts` | `canonical-authoring-builders.test.ts`; Partner screen specs | **PASS** |
| Typed creation method defines reusable type | `@carbroz/ui-sdk` | `SduiScreenBuilder`/hierarchy typed methods such as `addStackTemplate`, `addFormTemplate`, `addDefaultTemplate`, `addStackComponent`, `addStackSection`, `addStackGroup`, typed element methods | `canonical-authoring-builders.test.ts` asserts serialized canonical types | **PASS** |
| Known production definitions expose typed semantic properties instead of normal generic property bags | `@carbroz/ui-sdk` | `TypedPropertyBuilder.ts`, typed hierarchy/element Builders, definition-specific property schemas under `src/definitions` and atomic properties under `src/properties` | `property-contracts.test.ts`, `production-definitions.test.ts`, `stack-production-definitions.test.ts`, `typed-builders.test.ts` | **PASS** |
| Typed Theme Builder replaces giant raw production theme objects | `@carbroz/ui-sdk` | `sdui/ui-sdk/src/builder/ThemeBuilder.ts`; `SduiScreenBuilder.theme()` | `canonical-authoring-builders.test.ts` verifies canonical theme serialization | **PASS** |
| Typed Action -> Request -> Body Builder reuses canonical action/value-reference contract | `@carbroz/ui-sdk` | `sdui/ui-sdk/src/builder/ActionBuilders.ts`, typed button authoring | `canonical-authoring-builders.test.ts`, `action.schema.test.ts` verify `$binding`, `$context`, `$response`, `$literal` serialization | **PASS** |
| `screen.build()` recursively finalizes object graph and invokes canonical validation | `@carbroz/ui-sdk` | `BaseSduiScreenBuilder.ts` plus hierarchy Builders and validator boundary | `canonical-authoring-builders.test.ts`, `layered-validator.test.ts`, `screen.schema.test.ts` | **PASS** |
| Definition existence and exact definition-specific properties are strict; unknown/invalid definitions do not silently pass | `@carbroz/ui-sdk` | production definition registries under `src/definitions/*`; `DefinitionRegistry.ts` fail-fast behavior | `production-definitions.test.ts`, `definition-registry-extensibility.test.ts`, `property-contracts.test.ts`; CI fixtures were corrected rather than weakening schemas | **PASS** |
| Partner Login is the golden production Builder reference | Partner surface using `@carbroz/ui-sdk` | `apps/api/src/surfaces/partner/screens/builders/partner-login-screen.builder.ts` | `partner-login.screen.spec.ts` | **PASS** |
| Partner OTP uses same Builder language and preserves `partner_otp` / `tpl_partner_otp_v1` / `form_template` contract | Partner surface + frozen Auth contract | `partner-otp-screen.builder.ts`; `screen.addFormTemplate('tpl_partner_otp_v1')` | `partner-otp.screen.spec.ts` plus Auth integration coverage | **PASS** |
| Partner Dashboard uses same Builder language and preserves `partner_dashboard` / `partner_dashboard_template` / `default_template` contract | Partner surface + frozen Auth contract | `partner-dashboard-screen.builder.ts`; `screen.addDefaultTemplate('partner_dashboard_template')` | `partner-dashboard.screen.spec.ts` plus Auth integration coverage | **PASS** |
| Partner screen-specific Builders remain orchestration only, not a second SDUI framework | Partner surface | three screen Builders import/reuse `@carbroz/ui-sdk`; reusable schemas/registries are not redefined in the surface | Partner screen specs + architecture CI | **PASS** |
| Registry owns draft/version lifecycle and consumes canonical SDK validation | `@carbroz/sdui-registry` | `SduiRegistryUseCases.ts`; `PrismaSduiRegistryRepository.ts` uses `parseSduiScreen` for draft/hydration and `parseSduiScreenForPublication` for publish/rollback/direct publication | `sdui/registry/tests/SduiRegistryUseCases.spec.ts` plus repository/integration coverage and CI | **PASS** |
| Runtime Registry must not redefine canonical production Component/Section/Group/Element types | `@carbroz/sdui-registry` compatibility boundary | `PrismaSduiRegistryRepository.ts` compares against `PRODUCTION_*_TYPES` and rejects canonical type registration; `sdui/registry/README.md` documents the ownership boundary | Registry tests + architecture CI | **PASS** |
| Historical Registry node catalogue CRUD is not treated as the canonical definition registry | Registry compatibility/admin boundary | `sdui/registry/README.md`; guarded `createComponent/createSection/createGroup/createElement` paths | Existing Registry lifecycle/catalogue tests | **JUSTIFIED COMPATIBILITY** |
| Legacy built-template `ScreenBuilder` does not replace the canonical production root | `@carbroz/ui-sdk` compatibility boundary | `ScreenBuilder.ts` is explicitly documented as backward-compatible; `SduiScreenBuilder.ts` is the canonical production root | production Partner screens and canonical authoring tests use `SduiScreenBuilder` | **JUSTIFIED COMPATIBILITY** |
| Existing generic factories/raw helpers remain lower-level compatibility/extension mechanisms, not normal production screen authoring | `@carbroz/ui-sdk` compatibility boundary | `NodeFactories.ts`, legacy composition tests; production Partner screens do not use raw nested screen assembly | composition/registry extensibility tests; production screen inspection | **JUSTIFIED COMPATIBILITY** |
| Partner OTP challenge persistence remains Redis-only; SDUI convergence does not reintroduce Prisma OTP storage | Identity/Auth ownership | Auth implementation remains outside SDUI Builder changes; this campaign introduced no OTP persistence schema/model | full Backend CI, Architecture Closeout, existing Auth tests/migration gates | **PASS** |
| Canonical documentation reflects final returned-object, typed Theme, typed Action/Body architecture | SDUI architecture docs | `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`, `PHASE-A-SOURCE-RECONCILIATION.md`, `ui-sdk/README.md`, `registry/README.md` | source/doc forensic review | **PASS** |

## 3. Production anti-pattern sweep

The final source review checked the migrated production path for the prohibited patterns below.

| Prohibited pattern | Result |
|---|---|
| Giant raw `screen.withTheme({ ... })` production authoring | **NOT FOUND in migrated production path** |
| Raw nested request action `.onClick({ type: 'request', ... })` in migrated Partner screens | **NOT FOUND** |
| `currentComponent`, `currentSection`, `currentGroup` mutable composition cursor | **NOT FOUND** |
| Parent-ID lookup used to define Builder ownership | **NOT FOUND in canonical Builder path** |
| Direct `screenSchema.parse({ giant screen object })` production authoring | **NOT FOUND in migrated production path** |
| Generic `setProperties({...})` as normal known-definition authoring API | **NOT FOUND** |
| Partner-specific reusable primitives such as login/OTP-specific SDK element/component types | **NOT FOUND** |
| Runtime Registry registering/redefining canonical production SDK node types | **BLOCKED by repository guard** |
| Separate Registry hierarchy/property validator framework | **NOT FOUND; Registry delegates to UI SDK validation** |

## 4. Strict-schema CI incident and resolution

During exact-SHA verification, the production validator correctly rejected stale test fixtures that used legacy definition names and `text` elements without required `text` properties.

The resolution intentionally changed **tests/fixtures only**:

- canonical hierarchy fixtures now use registered production types such as `content_component`, `content_section`, and `row_group`;
- text fixtures now provide their required `text` value;
- Registry lifecycle fixtures now use canonical registered definitions.

Production schemas, definition strictness, validators, linting, architecture checks, and CI thresholds were **not weakened** to make old fixtures pass.

## 5. Retained compatibility boundaries

The following compatibility surfaces are intentionally retained and are not canonical production authoring APIs:

1. `ScreenBuilder` — compatibility facade for callers that already own a built Template. New production composition uses `SduiScreenBuilder`.
2. Generic node factories/raw helpers — lower-level compatibility/extensibility mechanisms; migrated Partner screens use typed returned-object Builders.
3. Runtime Registry Component/Section/Group/Element catalogue records — historical admin/persistence compatibility only. Canonical production UI SDK types are protected from redefinition.

Removal of these compatibility boundaries requires separate usage/persisted-data/route/test proof; deleting them merely to make the architecture look smaller would violate the source-reconciliation rule.

## 6. Gate evidence policy

A workflow result from a parent commit is useful diagnostic evidence but cannot freeze this audit commit.

The final freeze report must therefore record:

- exact final `development` SHA containing this audit;
- successful **CarBroz Backend CI** run ID on that SHA;
- successful **Backend Architecture Closeout Verifier** run ID on the same SHA;
- no later commit between those workflow results and the declared frozen SHA.

Until both exact-SHA gates are green, status is **CONVERGED, FREEZE PENDING GATES**. Once both are green on this audit SHA and no later source change exists, the SDUI convergence may be declared **COMPLETE + FROZEN**.
