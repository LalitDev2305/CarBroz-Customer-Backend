# CarBroz SDUI Single-Engine Dynamic Composition Architecture

> **Status: FINAL ARCHITECTURE CONTRACT — FROZEN FOR IMPLEMENTATION**
>
> This document is the single source of truth for the CarBroz backend SDUI architecture. The previous multi-layer `ui-sdk`/builder/factory/property/registry design is superseded by this contract. Implementation must converge the existing source toward this architecture without weakening existing production behavior, validation, tests, authentication contracts, or SDUI compatibility.

---

## 1. Purpose

CarBroz uses Server-Driven UI (SDUI) so the backend can describe application screens dynamically while the frontend renders them from a stable JSON contract.

The SDUI implementation must be:

- simple to understand;
- easy to extend;
- strongly typed;
- safe at runtime;
- reusable across Partner, Customer, and Admin applications;
- independent from business domains;
- free from duplicated builders, factories, validators, registries, and property systems;
- maintainable by a new developer without first learning an internal framework.

The final rule is:

> **One SDUI engine owns the complete SDUI presentation lifecycle: vocabulary → composition → screen resolution → validation → canonical output.**

Domains own business capability. SDUI owns presentation. API surfaces only transport requests and responses.

---

## 2. Architectural Principles

The implementation MUST follow these principles.

### 2.1 Single responsibility

Every class has one clear reason to change.

```text
Domain              → business rules
SDUI node definition→ what one UI type supports
SduiBuilder          → how a UI tree is composed
ScreenComposer       → what one specific screen contains
ScreenRegistry       → which screen composer handles a screen request
SduiValidator        → whether final output is valid
SduiService          → one public orchestration entry point
API Surface          → HTTP transport only
```

### 2.2 Dependency direction

```text
apps/api
   ↓
SDUI Engine
   ↓
Domain public contracts/use cases only when screen context requires business data

Domains ─X→ SDUI Engine
Domains ─X→ Fastify
Domains ─X→ screen builders/composers
```

Identity, Partner, Customer, Booking, Catalog, Financials, and other domains MUST NOT import SDUI implementation classes.

### 2.3 No framework inside the framework

Do not introduce abstractions merely because a design pattern exists.

A new abstraction is allowed only when it removes duplication, enforces a real invariant, or creates a stable boundary.

### 2.4 Prefer explicit code over hidden state

Forbidden composition techniques:

```text
currentComponent
currentSection
currentGroup
global mutable parent cursor
parent ID lookup
implicit hierarchy mutation
manual cross-tree child attachment
```

The visible code structure must make the resulting UI hierarchy obvious.

---

## 3. Canonical SDUI Hierarchy

The hierarchy remains frozen:

```text
Screen
  └── Template
      └── Component
          └── Element
```

or:

```text
Screen
  └── Template
      └── Component
          └── Section
              └── Element
```

or:

```text
Screen
  └── Template
      └── Component
          └── Section
              └── Group
                  └── Element
```

Mandatory rules:

1. Screen owns exactly one Template.
2. Template owns one or more Components.
3. Component owns Elements **OR** Sections, never both.
4. Section owns Elements **OR** Groups, never both.
5. Group owns Elements only.
6. Element is terminal.
7. Component cannot directly own Group.
8. Template cannot directly own Section, Group, or Element.
9. Group cannot own Group or Section.
10. Element cannot own children.

The XOR rules are permanent:

```text
Component → Elements XOR Sections
Section   → Elements XOR Groups
```

They must be prevented by the composition API where practical and validated again before output.

---

## 4. Canonical Semantic Model

Every SDUI node follows the same semantic meaning:

```text
id          = instance identity on one screen
type        = reusable rendering behavior
properties  = values for this instance
children    = owned hierarchy when the node is structural
```

Example:

```text
id   = login_content
type = stack_component
```

Do not create screen-specific reusable types such as:

```text
login_stack_component
otp_stack_component
partner_login_text
customer_login_button
```

Reusable types remain generic. Screen-specific values belong in screen composers.

---

## 5. Final Design Patterns

Only the following patterns are intentionally used.

| Requirement | Pattern | Reason |
|---|---|---|
| Hierarchical SDUI tree | **Composite** | Screen content is naturally a tree of containers and leaves. |
| Readable tree construction | **Builder / Internal DSL** | Makes hierarchy readable while hiding array assembly. |
| Resolve a screen by app + screen ID | **Registry + Factory Method behavior** | Maps requests to the correct screen composer without switch statements across API code. |
| Different screen implementations behind one contract | **Strategy via `ScreenComposer`** | Every screen provides the same `build(context)` behavior. |
| Validation | Plain schema + semantic validation | No additional pattern is needed. |
| Actions/theme/value objects | Typed objects + small helper functions | Builder classes would add unnecessary complexity. |

Patterns not required by this architecture must not be added without a concrete need.

---

## 6. One Canonical SDUI Module

The target architecture is one module:

```text
sdui/
└── engine/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── core/
    │   │   ├── SduiModel.ts
    │   │   ├── SduiBuilder.ts
    │   │   ├── SduiValidator.ts
    │   │   ├── NodeDefinition.ts
    │   │   ├── Action.ts
    │   │   ├── Theme.ts
    │   │   └── value-objects/
    │   │       ├── Dimension.ts
    │   │       ├── Spacing.ts
    │   │       ├── Background.ts
    │   │       ├── Border.ts
    │   │       └── Shape.ts
    │   │
    │   ├── nodes/
    │   │   ├── template/
    │   │   │   ├── StackTemplate.ts
    │   │   │   ├── FormTemplate.ts
    │   │   │   └── DefaultTemplate.ts
    │   │   ├── component/
    │   │   │   ├── StackComponent.ts
    │   │   │   ├── FormComponent.ts
    │   │   │   └── ContentComponent.ts
    │   │   ├── section/
    │   │   │   └── StackSection.ts
    │   │   ├── group/
    │   │   │   └── StackGroup.ts
    │   │   ├── element/
    │   │   │   ├── Text.ts
    │   │   │   ├── Image.ts
    │   │   │   ├── Input.ts
    │   │   │   ├── Button.ts
    │   │   │   ├── Icon.ts
    │   │   │   ├── Divider.ts
    │   │   │   └── Spacer.ts
    │   │   └── definitions.ts
    │   │
    │   ├── screens/
    │   │   ├── partner/
    │   │   │   ├── PartnerLoginScreen.ts
    │   │   │   ├── PartnerOtpScreen.ts
    │   │   │   └── PartnerDashboardScreen.ts
    │   │   ├── customer/
    │   │   │   ├── CustomerLoginScreen.ts
    │   │   │   ├── CustomerOtpScreen.ts
    │   │   │   └── CustomerDashboardScreen.ts
    │   │   └── admin/
    │   │
    │   ├── registry/
    │   │   └── ScreenRegistry.ts
    │   │
    │   ├── SduiService.ts
    │   └── index.ts
    │
    └── tests/
```

The exact file count may evolve when a file becomes too large, but the responsibility boundaries above are frozen.

### 6.1 Existing source convergence

The current `sdui/ui-sdk` and `sdui/registry` packages are migration sources, not permanent parallel engines.

Implementation must converge them into the single engine.

During migration:

- KEEP stable canonical JSON contracts and behavior;
- KEEP required runtime publication/version behavior until safely moved;
- EXTEND only where the target design needs functionality;
- MODIFY existing source where ownership is wrong;
- CREATE only missing target pieces;
- DELETE compatibility source only after references and tests prove it is safe.

Do not maintain both old and new authoring architectures after migration completes.

---

## 7. Node Definitions: One File Owns One UI Type

The most important simplification is **co-location**.

A reusable UI type must not require developers to search separate `definitions`, `properties`, `builders`, and `factory` folders to understand it.

Example target file:

```text
nodes/component/StackComponent.ts
```

It owns:

- canonical type name;
- exact property schema;
- TypeScript property type;
- hierarchy capability metadata;
- definition metadata required by validation.

Example:

```ts
export const STACK_COMPONENT = 'stack_component';

export const StackComponentPropertiesSchema = z.object({
  axis: z.enum(['vertical', 'horizontal']).optional(),
  spacing: z.number().nonnegative().optional(),
  width: DimensionSchema.optional(),
  height: DimensionSchema.optional(),
  padding: SpacingSchema.optional(),
  background: BackgroundSchema.optional(),
  border: BorderSchema.optional(),
  shape: ShapeSchema.optional(),
});

export type StackComponentProperties =
  z.infer<typeof StackComponentPropertiesSchema>;

export const StackComponentDefinition = {
  type: STACK_COMPONENT,
  level: 'component',
  properties: StackComponentPropertiesSchema,
  children: {
    oneOf: ['elements', 'sections'],
  },
} satisfies NodeDefinition;
```

A developer opening one file must understand what that UI type is allowed to do.

---

## 8. Shared Value Objects Are Small Reusable Schemas

Shared concepts remain reusable but do not become their own architecture layer.

Examples:

```text
Dimension
Spacing
Background
Border
Shape
Gradient
Typography
```

They live under:

```text
core/value-objects/
```

Definitions import them directly.

There is no standalone property framework that screen authors must understand.

---

## 9. Single Definition Registry

Every supported reusable node type is registered exactly once.

Example:

```ts
export const nodeDefinitions = {
  templates: {
    stack_template: StackTemplateDefinition,
    form_template: FormTemplateDefinition,
    default_template: DefaultTemplateDefinition,
  },

  components: {
    stack_component: StackComponentDefinition,
    form_component: FormComponentDefinition,
    content_component: ContentComponentDefinition,
  },

  sections: {
    stack_section: StackSectionDefinition,
  },

  groups: {
    stack_group: StackGroupDefinition,
  },

  elements: {
    text: TextDefinition,
    image: ImageDefinition,
    input: InputDefinition,
    button: ButtonDefinition,
    icon: IconDefinition,
    divider: DividerDefinition,
    spacer: SpacerDefinition,
  },
} as const;
```

There must not be:

- a second definition registry;
- a second property contract registry;
- Registry-layer redefinition of canonical node behavior;
- screen-specific primitive definitions.

---

## 10. Builder Responsibility: Only Build the Tree

The Builder pattern is used only where it provides real value: hierarchical composition.

The public composition experience should visually resemble the resulting tree.

Example:

```ts
return sdui.screen(
  {
    id: 'partner_login',
    targetApp: 'PARTNER',
    theme: lightTheme(),
  },
  screen => {
    screen.template(
      'stack_template',
      'partner_login_template',
      {
        axis: 'vertical',
        spacing: 24,
      },
      template => {
        template.component(
          'stack_component',
          'login_content',
          {
            axis: 'vertical',
            spacing: 16,
          },
          component => {
            component.section(
              'stack_section',
              'mobile_section',
              {},
              section => {
                section.input('mobile_number', {
                  placeholder: '98765 43210',
                  inputType: 'phone',
                  binding: 'mobileNumber',
                  required: true,
                });
              },
            );
          },
        );
      },
    );
  },
);
```

Indentation reflects ownership:

```text
Screen
  Template
    Component
      Section
        Input
```

### 10.1 Internal scopes

Internally the Builder may use small scope objects:

```text
ScreenScope
TemplateScope
ComponentScope
SectionScope
GroupScope
```

These exist only to expose legal child operations and collect children.

They are not public architectural concepts that screen authors must instantiate.

### 10.2 No Builder class for every type

Do not create a separate public Builder class for every definition.

Avoid designs such as:

```text
StackTemplateBuilder
StackComponentBuilder
StackSectionBuilder
StackGroupBuilder
TextBuilder
InputBuilder
ButtonBuilder
TypedPropertyBuilder
ElementParentBuilder
```

unless a concrete behavior cannot be expressed cleanly by the small scope DSL and typed definition.

The default is: **definition + typed properties + generic scope method**.

---

## 11. Generic Node Creation Is Internal

A single internal helper is sufficient for ordinary node construction.

Conceptually:

```ts
function createNode<TProperties>(
  definition: NodeDefinition<TProperties>,
  id: string,
  properties: TProperties,
  children?: SduiNode[],
): SduiNode {
  return {
    id,
    type: definition.type,
    properties,
    ...(children ? { children } : {}),
  };
}
```

There is no need for public TemplateFactory, ComponentFactory, SectionFactory, GroupFactory, ElementFactory, and BuilderFactory classes.

The generic node creator is an engine implementation detail.

---

## 12. Actions Are Typed Values, Not Builder Trees

Actions remain strongly typed but use declarative typed objects and small helper functions.

Preferred authoring:

```ts
section.button('continue', {
  text: 'Continue',
  action: requestAction({
    method: 'POST',
    endpoint: '/api/v1/partner/auth/send_otp',
    authentication: 'NONE',
    validate: true,
    responseMode: 'destination',
    body: {
      phoneNumber: binding('mobileNumber'),
      deviceId: context('deviceId'),
    },
  }),
});
```

Small helpers own serialization details:

```ts
binding('mobileNumber')
context('deviceId')
response('challengeId')
literal('value')
```

They serialize to the existing canonical wire contract such as:

```json
{ "$binding": "mobileNumber" }
```

Screen composers must not manually encode `$binding`, `$context`, or other protocol markers.

No fluent `ActionBuilder` hierarchy is required unless future requirements prove declarative actions insufficient.

---

## 13. Theme Is a Typed Value, Not a Builder Tree

Theme configuration is data, not hierarchy.

Preferred form:

```ts
theme: {
  mode: 'light',
  statusBar: 'transparent',
  background: linearGradient({
    angle: 135,
    colors: [
      ['#DDF8F6', 0],
      ['#F7FEFD', 0.28],
      ['#FFFFFF', 0.55],
      ['#D9F7F4', 1],
    ],
  }),
}
```

Theme and gradient helpers must return canonical typed values.

No `ThemeBuilder` hierarchy is required.

---

## 14. Screen Composer Contract

Actual product screens live inside the SDUI engine under `screens/<app>/`.

They are named **Screen** or **ScreenComposer**, not `ScreenBuilder`.

Reason:

- `SduiBuilder` is the reusable authoring tool;
- `PartnerLoginScreen` is the recipe for one specific screen;
- `ScreenRegistry` resolves recipes.

Canonical contract:

```ts
export interface ScreenComposer {
  readonly screenId: string;
  readonly targetApp: TargetApp;

  build(context: ScreenContext): SduiScreen;
}
```

Example:

```ts
export class PartnerLoginScreen implements ScreenComposer {
  readonly screenId = 'partner_login';
  readonly targetApp = 'PARTNER' as const;

  build(context: ScreenContext): SduiScreen {
    return sdui.screen(
      {
        id: this.screenId,
        targetApp: this.targetApp,
        theme: partnerAuthTheme,
      },
      screen => {
        // screen composition only
      },
    );
  }
}
```

A screen composer may use values from `ScreenContext`, but it must not contain domain business rules.

---

## 15. Screen Ownership

All SDUI screen composition belongs to the SDUI engine.

Correct:

```text
sdui/engine/src/screens/partner/PartnerLoginScreen.ts
sdui/engine/src/screens/partner/PartnerOtpScreen.ts
sdui/engine/src/screens/customer/CustomerLoginScreen.ts
```

Incorrect:

```text
domains/identity/presentation/sdui/...
domains/partner/presentation/sdui/...
apps/api/src/surfaces/partner/screens/builders/...
```

After migration, no domain or API surface owns canonical SDUI screen composition.

### 15.1 Identity remains shared

Identity still owns shared authentication capability:

```text
OTP policy
challenge state
verification
rate limits
session creation
refresh tokens
authentication/authorization
```

Partner and Customer screens may both call/use the same Identity application contracts through the API flow, but Identity never owns Partner or Customer UI composition.

---

## 16. Screen Registry

`ScreenRegistry` maps `(targetApp, screenId)` to a `ScreenComposer`.

Example:

```ts
const screens = new Map<string, ScreenComposer>([
  ['PARTNER:partner_login', new PartnerLoginScreen()],
  ['PARTNER:partner_otp', new PartnerOtpScreen()],
  ['PARTNER:partner_dashboard', new PartnerDashboardScreen()],
  ['CUSTOMER:customer_login', new CustomerLoginScreen()],
]);
```

Canonical behavior:

```ts
export class ScreenRegistry {
  constructor(
    private readonly composers: readonly ScreenComposer[],
  ) {}

  get(targetApp: TargetApp, screenId: string): ScreenComposer {
    const composer = this.lookup(targetApp, screenId);

    if (!composer) {
      throw new UnknownScreenError(targetApp, screenId);
    }

    return composer;
  }
}
```

Registration must fail on duplicate `(targetApp, screenId)` ownership.

No API controller contains a large switch statement for screen IDs.

---

## 17. SduiService Is the Single Public Entry Point

External backend code talks to one façade:

```ts
export class SduiService {
  constructor(
    private readonly screenRegistry: ScreenRegistry,
    private readonly validator: SduiValidator,
  ) {}

  buildScreen(request: BuildScreenRequest): SduiScreen {
    const composer = this.screenRegistry.get(
      request.targetApp,
      request.screenId,
    );

    const screen = composer.build(request.context);

    return this.validator.validate(screen);
  }
}
```

External callers must not orchestrate:

```text
registry.get(...)
composer.build(...)
validator.validate(...)
serializer.serialize(...)
```

manually.

They call:

```ts
sduiService.buildScreen(...)
```

This is the single obvious entry point.

---

## 18. Complete Runtime Call Flow

### 18.1 Screen request

```text
Mobile App
   │
   │ GET /api/v1/partner/screen/auth_login
   ▼
Partner Route
   ▼
Partner Controller
   ▼
SduiService.buildScreen(...)
   │
   ├── targetApp = PARTNER
   ├── screenId  = partner_login
   └── context   = request/application context
   ▼
ScreenRegistry.get(PARTNER, partner_login)
   ▼
PartnerLoginScreen.build(context)
   ▼
SduiBuilder/Internal DSL
   │
   ├── Screen
   ├── Template
   ├── Components
   ├── Sections/Groups
   └── Elements
   ▼
SduiScreen object
   ▼
SduiValidator.validate(screen)
   │
   ├── structural schema
   ├── hierarchy rules
   ├── definition existence
   ├── exact property schemas
   ├── semantic invariants
   ├── schema version
   └── target app
   ▼
Validated canonical SduiScreen
   ▼
Controller response
   ▼
Mobile SDUI renderer
```

### 18.2 Authentication action flow

```text
PartnerLoginScreen
   ↓
Button action
   ↓
POST /api/v1/partner/auth/send_otp
   ↓
Partner Auth Controller
   ↓
Identity SendOtpUseCase
   ↓
Identity/Redis authentication flow
   ↓
Destination metadata
   ↓
Client requests partner_otp screen
   ↓
SduiService
   ↓
PartnerOtpScreen
```

Identity owns authentication behavior. SDUI owns the visual screen descriptions. Neither takes the other's responsibility.

---

## 19. Class Responsibility and Call Matrix

| Class / Module | Responsibility | Calls / Uses | Must NOT Do |
|---|---|---|---|
| `SduiModel` | Canonical wire/domain-neutral SDUI TypeScript model | Zod/types as needed | Screen-specific behavior |
| `NodeDefinition` | Contract describing one reusable node type | property schemas | Build product screens |
| `StackComponentDefinition`, etc. | Type + exact properties + allowed hierarchy metadata | shared value schemas | Know Partner/Customer screens |
| `SduiBuilder` | Build the hierarchy through nested scopes | definitions, internal `createNode` | Resolve screen IDs or business rules |
| `ScreenScope` | Add one Template | `TemplateScope` | Add Sections/Elements directly |
| `TemplateScope` | Add Components | `ComponentScope` | Add Sections/Groups/Elements directly |
| `ComponentScope` | Add Elements OR Sections | element creation, `SectionScope` | Add Group directly or mix XOR modes |
| `SectionScope` | Add Elements OR Groups | element creation, `GroupScope` | Mix XOR modes |
| `GroupScope` | Add Elements only | element creation | Add Section/Group |
| action helpers | Create canonical action/value-reference objects | action schemas/types | Perform HTTP calls |
| theme helpers | Create canonical typed theme values | theme schemas/types | Build hierarchy |
| `ScreenComposer` | Stable interface for one product screen | `SduiBuilder` | Domain business rules |
| `PartnerLoginScreen` etc. | Exact composition for one screen | DSL, typed values/context | Define reusable primitive contracts |
| `ScreenRegistry` | Map app + screen ID to composer | composers | Validate screen tree or contain screen composition |
| `SduiValidator` | Validate completed canonical tree | node definitions + schemas | Modify invalid screens |
| `SduiService` | Public façade/orchestration | registry + composer + validator | Contain product screen layout |
| API Controller | Translate HTTP request/response | `SduiService` | Build SDUI nodes |
| Business Domain | Business rules/use cases | domain ports | Import SDUI classes |

---

## 20. Validation Architecture

Validation remains strict and layered.

`SduiValidator` is the single canonical validation boundary for built screens.

Validation stages:

```text
1. Root structural validation
2. Hierarchy validation
3. Definition existence validation
4. Exact property validation per definition
5. Semantic/invariant validation
6. Schema version validation
7. Target-app validation
8. Publication validation where persisted SDUI lifecycle requires it
```

### 20.1 Structural validation

Checks required fields and basic node shapes.

### 20.2 Hierarchy validation

Checks:

```text
Screen → exactly one Template
Template → Components only
Component → Elements XOR Sections
Section → Elements XOR Groups
Group → Elements only
Element → no children
```

### 20.3 Definition validation

Every `type` must exist at the expected hierarchy level.

A `stack_component` cannot be accepted as an element merely because the JSON shape is technically valid.

### 20.4 Exact property validation

The selected node definition validates the complete property object.

Unknown properties must not silently pass for known production definitions.

### 20.5 Validator behavior

The validator:

- returns the validated canonical screen;
- throws/returns a deterministic validation error on invalid input;
- does not mutate input to repair mistakes;
- does not silently drop invalid values;
- does not weaken strictness for backward compatibility without an explicit schema-version rule.

---

## 21. Serialization

If the internal TypeScript model already matches the canonical JSON contract, no separate serializer class is required.

Preferred flow:

```text
Typed object
   ↓
Validation
   ↓
JSON response
```

A dedicated serializer is allowed only if there is a real transformation that cannot be handled cleanly by typed helper functions.

Protocol-specific translation such as:

```ts
binding('mobileNumber')
```

to:

```json
{ "$binding": "mobileNumber" }
```

is owned by the helper that creates the typed value.

---

## 22. Persisted SDUI / Admin Publication Boundary

The existing SDUI Registry package currently owns persisted lifecycle behavior. During convergence that behavior must not be deleted blindly.

If persisted draft/publish/version functionality is still required, it moves inside the single SDUI engine behind explicitly named lifecycle services/repositories, for example:

```text
publication/
    SduiPublicationService.ts
    SduiDocumentRepository.ts
```

Do **not** call this product-screen lookup service `ScreenRegistry`; that name is reserved for code-defined screen composer resolution.

Publication responsibilities may include:

```text
CREATE draft
UPDATE draft
VALIDATE draft
PUBLISH
ARCHIVE
RETRIEVE published version
VERSION HISTORY
ROLLBACK where already supported
```

Publication must use the same `SduiValidator` before a document becomes publishable.

There must never be a second canonical definition/validation system inside publication code.

---

## 23. API Surface Responsibility

API surfaces remain thin.

Example:

```ts
const screen = sduiService.buildScreen({
  targetApp: 'PARTNER',
  screenId: 'partner_login',
  context,
});

return reply.send(screen);
```

API surfaces may own:

- route declaration;
- authentication middleware;
- HTTP DTO/request parsing;
- request context creation;
- mapping deterministic errors to HTTP status codes.

They must not own:

- SDUI node definitions;
- reusable UI properties;
- product screen composition;
- screen-specific builders;
- SDUI hierarchy validation.

---

## 24. Full Partner Login Example

The following is the target developer experience. Exact visual values may change with product requirements; architectural form is frozen.

```ts
export class PartnerLoginScreen implements ScreenComposer {
  readonly screenId = 'partner_login';
  readonly targetApp = 'PARTNER' as const;

  build(_context: ScreenContext): SduiScreen {
    return sdui.screen(
      {
        id: this.screenId,
        targetApp: this.targetApp,
        theme: {
          mode: 'light',
          statusBar: 'transparent',
          background: linearGradient({
            angle: 135,
            colors: [
              ['#DDF8F6', 0],
              ['#F7FEFD', 0.28],
              ['#FFFFFF', 0.55],
              ['#D9F7F4', 1],
            ],
          }),
        },
      },
      screen => {
        screen.template(
          'stack_template',
          'partner_login_template',
          {
            axis: 'vertical',
            spacing: 24,
            padding: 24,
          },
          template => {
            template.component(
              'stack_component',
              'brand',
              {
                axis: 'vertical',
                alignment: 'center',
                spacing: 8,
              },
              component => {
                component.image('logo', {
                  source: '/images/carbroz_logo.png',
                });

                component.text('brand_name', {
                  text: 'CarBroz',
                  fontSize: 44,
                  fontWeight: 700,
                });

                component.text('welcome', {
                  text: 'Welcome Partner!',
                  fontSize: 32,
                });
              },
            );

            template.component(
              'stack_component',
              'login',
              {
                axis: 'vertical',
                spacing: 16,
              },
              component => {
                component.section(
                  'stack_section',
                  'mobile_section',
                  {},
                  section => {
                    section.input('mobile_number', {
                      inputType: 'phone',
                      placeholder: '98765 43210',
                      binding: 'mobileNumber',
                      maxLength: 10,
                      required: true,
                    });
                  },
                );

                component.section(
                  'stack_section',
                  'actions',
                  {},
                  section => {
                    section.button('continue', {
                      text: 'Continue',
                      action: requestAction({
                        method: 'POST',
                        endpoint: '/api/v1/partner/auth/send_otp',
                        authentication: 'NONE',
                        validate: true,
                        responseMode: 'destination',
                        body: {
                          phoneNumber: binding('mobileNumber'),
                          deviceId: context('deviceId'),
                        },
                      }),
                    });
                  },
                );
              },
            );
          },
        );
      },
    );
  }
}
```

A new developer should be able to read this file and understand the screen without studying engine internals.

---

## 25. Adding a New Reusable UI Type

Example: adding a new `rating` element.

Required steps:

```text
1. Create nodes/element/Rating.ts
2. Define RATING type constant
3. Define exact RatingPropertiesSchema
4. Export RatingProperties type
5. Define RatingDefinition
6. Register once in nodes/definitions.ts
7. Add a small typed `rating(...)` element helper to legal scopes
8. Add definition/property/hierarchy tests
9. Use it from a screen composer
```

Do NOT also create:

```text
RatingBuilder
RatingFactory
RatingPropertyBuilder
RatingSerializer
RatingRegistry
```

unless an actual requirement makes one necessary.

---

## 26. Adding a New Screen

Example: `PartnerEarningsScreen`.

Steps:

```text
1. Create screens/partner/PartnerEarningsScreen.ts
2. Implement ScreenComposer
3. Compose with the existing SduiBuilder DSL
4. Use only registered reusable node types
5. Register PARTNER:partner_earnings in ScreenRegistry composition root
6. Add unit/snapshot/contract tests
7. Add route/destination mapping only if not already generic
8. Run SDUI tests + full repository gates
```

No domain Builder and no API-surface Builder is created.

---

## 27. Screen Context

`ScreenContext` carries request/runtime data required for presentation decisions.

It may include safe values such as:

```text
locale
app version
platform
feature flags
resolved presentation data
safe user/partner/customer view data
```

It must not become a service locator.

Forbidden inside `ScreenContext`:

```text
PrismaClient
Redis client
FastifyRequest
repositories
entire DI container
arbitrary infrastructure services
```

Business data should be resolved through appropriate application use cases before or around the SDUI orchestration boundary, then passed as deterministic presentation data.

---

## 28. Error Model

The engine must use deterministic typed errors.

Minimum categories:

```text
UNKNOWN_SCREEN
DUPLICATE_SCREEN_REGISTRATION
INVALID_SCREEN_ROOT
INVALID_HIERARCHY
UNKNOWN_NODE_DEFINITION
INVALID_NODE_PROPERTIES
UNSUPPORTED_SCHEMA_VERSION
INVALID_TARGET_APP
PUBLICATION_VALIDATION_FAILED
```

Errors must contain enough path/context information to diagnose the node, for example:

```text
screen=partner_login
path=template.components[1].sections[0].elements[0]
type=input
reason=unknown property "foo"
```

Never log secrets, OTP plaintext, access tokens, or unmasked PII through validation diagnostics.

---

## 29. Testing Strategy

Testing is part of the architecture contract.

### 29.1 Definition tests

For every reusable node definition verify:

- valid minimum properties pass;
- valid full properties pass;
- unknown properties fail where strictness applies;
- invalid enum/value types fail;
- required properties fail when missing;
- hierarchy level is correct.

### 29.2 Builder/DSL tests

Verify:

- Screen accepts exactly one Template;
- Template accepts Components only;
- Component direct Elements work;
- Component Sections work;
- Component Elements + Sections fails;
- Section direct Elements work;
- Section Groups work;
- Section Elements + Groups fails;
- Group accepts Elements only;
- Element cannot receive children;
- nested callbacks preserve exact parent ownership;
- sibling creation never changes previous parent ownership.

### 29.3 Action helper tests

Verify:

```text
binding(...) → {$binding: ...}
context(...) → {$context: ...}
response(...)→ expected canonical response reference
literal(...) → expected literal representation
```

Also verify request action fields and body validation.

### 29.4 Theme tests

Verify typed theme helpers produce exactly the canonical serialized contract.

### 29.5 ScreenRegistry tests

Verify:

- known app + screen resolves correct composer;
- unknown screen fails deterministically;
- duplicate `(targetApp, screenId)` registration fails;
- same `screenId` may exist for different apps only when intentionally registered under different target apps.

### 29.6 Screen composer tests

For Partner Login, OTP, Dashboard and each migrated screen verify:

- expected root identity;
- expected template type/ID;
- expected critical node IDs/types;
- expected action endpoint/authentication/body references;
- final output passes canonical validator;
- no raw manual hierarchy arrays are authored in production screen files.

### 29.7 Validator negative tests

Explicitly test malformed trees:

```text
Template → Element
Component → Group
Component → Element + Section
Section → Element + Group
Group → Group
Group → Section
Element → children
unknown node type
wrong definition level
invalid property
unknown property
unsupported schema version
invalid target app
```

All must fail.

### 29.8 API integration tests

Verify API route → `SduiService` → screen response for representative Partner and Customer screens.

Verify errors are mapped deterministically.

### 29.9 Architecture regression tests

Automated gates must prevent:

- SDUI imports inside business domain production code;
- SDUI screen composers under `domains/**`;
- canonical screen composers under `apps/api/**` after migration;
- duplicate screen ownership;
- reintroduction of old public `BaseSduiScreenBuilder`/typed-builder hierarchy after removal;
- production raw giant screen JSON construction;
- production use of hidden parent cursors;
- parallel node-definition registries;
- publication code redefining canonical node definitions.

---

## 30. Verified Repository Commands

Repository requirements currently declare:

```text
Node >= 22
pnpm 11.9.0
```

### 30.1 Install

From repository root:

```bash
corepack enable
pnpm install --frozen-lockfile
```

### 30.2 Full workspace build

```bash
pnpm build
```

This runs workspace package builds recursively.

### 30.3 Lint

```bash
pnpm lint
```

### 30.4 Full test suite

Interactive/watch-style root command:

```bash
pnpm test
```

For deterministic CI-style execution prefer:

```bash
pnpm exec vitest run
```

### 30.5 Coverage

```bash
pnpm test:coverage
```

### 30.6 Production freeze suite

```bash
pnpm freeze:preflight
pnpm test:freeze
```

### 30.7 Current `ui-sdk` package commands during migration

Until the old package is retired:

```bash
pnpm --filter @carbroz/ui-sdk build
pnpm --filter @carbroz/ui-sdk test
pnpm --filter @carbroz/ui-sdk test:coverage
```

### 30.8 Current SDUI Registry build during migration

Until the old Registry package is retired:

```bash
pnpm --filter @carbroz/sdui-registry build
```

Registry tests are currently executed through the repository Vitest configuration/root suite where applicable; the existing Registry package does not currently declare its own `test` script.

### 30.9 Target engine commands

The new `@carbroz/sdui-engine` package must expose at least:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

After creation:

```bash
pnpm --filter @carbroz/sdui-engine build
pnpm --filter @carbroz/sdui-engine test
pnpm --filter @carbroz/sdui-engine test:coverage
```

---

## 31. Required Verification Sequence Before Each SDUI Phase Freeze

Run in this order:

```bash
pnpm --filter @carbroz/sdui-engine build
pnpm --filter @carbroz/sdui-engine test
pnpm --filter @carbroz/sdui-engine test:coverage
pnpm build
pnpm lint
pnpm exec vitest run
pnpm test:coverage
pnpm freeze:preflight
pnpm test:freeze
```

During migration, also run relevant old-package builds/tests until all callers have moved.

No architecture phase is frozen only because unit tests pass locally. The same source SHA must pass the repository's required CI/architecture gates before the phase is considered complete.

---

## 32. Migration Strategy

Implementation must be incremental and behavior-preserving.

### Phase 0 — Baseline and usage audit

Before changing source:

- inventory all current SDUI packages/files;
- trace all imports/exports;
- identify runtime routes using Partner Login/OTP/Dashboard;
- identify stale Identity and API-surface screen builders;
- identify current Registry persistence/publication behavior;
- record current canonical JSON outputs for golden screens;
- run baseline tests and capture failures, if any.

No deletion occurs in Phase 0.

### Phase 1 — Create engine core

Create:

```text
sdui/engine
core model
NodeDefinition
value objects
single definition registry
validator skeleton
```

Reuse existing canonical schemas/contracts instead of rewriting behavior unnecessarily.

### Phase 2 — Migrate node definitions

Move/converge Template, Component, Section, Group, and Element definitions.

For each definition:

- type;
- exact properties;
- level;
- hierarchy metadata;

must become understandable from one local definition file.

### Phase 3 — Implement small nested DSL

Create `SduiBuilder` and hierarchy scopes.

Prove all XOR/hierarchy rules with unit tests before migrating product screens.

### Phase 4 — Converge Action and Theme authoring

Replace fluent Action/Theme Builder requirements with typed values + small helpers while preserving canonical JSON output.

### Phase 5 — Create screen contracts and ScreenRegistry

Create:

```text
ScreenComposer
ScreenContext
ScreenRegistry
```

Add duplicate registration and unknown-screen tests.

### Phase 6 — Create SduiService façade

All external callers use `SduiService` as the public orchestration boundary.

### Phase 7 — Migrate golden Partner screens

Migrate in this order:

```text
Partner Login
Partner OTP
Partner Dashboard
```

For every screen compare canonical output and preserve frozen API/auth behavior.

### Phase 8 — Remove duplicate screen ownership

After references prove safe:

- remove Identity-owned Partner SDUI builders;
- remove API-surface-owned Partner screen builders once engine versions are wired;
- add architecture gates preventing recurrence.

### Phase 9 — Converge persisted Registry lifecycle

Move any still-required draft/publish/version behavior behind the engine and the canonical validator.

Do not re-create a second SDUI definition system.

### Phase 10 — Migrate remaining screens

Migrate remaining Partner, Customer, and Admin SDUI screens.

### Phase 11 — Retire old packages/compatibility APIs

Only after zero production references remain:

- remove obsolete `ui-sdk` builder hierarchy;
- remove obsolete NodeFactories;
- remove obsolete separate property architecture;
- remove obsolete duplicate Registry contracts;
- remove compatibility exports;
- update workspace dependencies and docs.

### Phase 12 — Final forensic audit and freeze

Audit the entire repository for:

```text
old SDUI imports
duplicate builders
raw giant JSON screen construction
hidden hierarchy state
duplicate definitions
screen composition in domains
screen composition in API surfaces
parallel validators
parallel serializers without need
invalid hierarchy APIs
stale documentation
```

Then run the complete verification sequence and CI on the same SHA.

---

## 33. Frozen Authentication Behavior During SDUI Migration

SDUI simplification must not redesign authentication business behavior.

Preserve the existing Partner authentication contracts unless a separate explicitly approved requirement changes them.

Examples that must remain behaviorally stable through migration include:

```text
Partner Login action
POST /api/v1/partner/auth/send_otp

Partner OTP verification
POST /api/v1/partner/auth/verify_otp
```

Identity remains responsible for OTP/session semantics and Redis-backed production OTP challenge behavior.

SDUI migration changes presentation ownership and authoring architecture only.

---

## 34. Naming Rules

Use names that communicate responsibility.

Preferred:

```text
SduiBuilder
ScreenComposer
PartnerLoginScreen
ScreenRegistry
SduiValidator
SduiService
StackComponentDefinition
TextDefinition
```

Avoid ambiguous or overlapping names such as:

```text
BaseSduiScreenBuilder
ScreenBuilder
SduiScreenBuilder
PartnerLoginScreenBuilder
BuilderFactory
DefinitionBuilder
TypedPropertyBuilder
ElementParentBuilder
```

unless a future concrete requirement proves one is necessary.

---

## 35. Public API Rules

The engine's public `index.ts` should expose the smallest practical surface.

Application/API consumers normally need:

```text
SduiService
SduiScreen / output contract
BuildScreenRequest / public error types
```

Screen composers inside the engine may import internal DSL and definitions through internal paths.

Do not export every internal scope/factory/helper merely because another file might someday use it.

---

## 36. Definition of Done for the Architecture Migration

The migration is complete only when all are true:

- one canonical SDUI engine exists;
- no production domain owns SDUI screen composition;
- no production API surface owns canonical SDUI screen composition;
- all code-defined product screens live under `sdui/engine/src/screens`;
- one `SduiBuilder` DSL owns hierarchy construction;
- UI definitions co-locate type + properties + hierarchy metadata;
- one node-definition registry exists;
- one canonical validator exists;
- `SduiService` is the public orchestration entry point;
- `ScreenRegistry` uniquely resolves app + screen ID;
- Action and Theme are typed values/helpers rather than unnecessary builder trees;
- hidden current-parent state does not exist;
- manual production child-array composition does not exist;
- stale Identity and API-surface screen builders are removed;
- persisted publication behavior, if retained, uses the same validator/definitions;
- Partner Login/OTP/Dashboard behavior remains compatible;
- all new and existing tests pass;
- coverage gates pass;
- lint passes;
- full workspace build passes;
- architecture/freeze gates pass;
- CI passes on the exact freeze SHA;
- final forensic audit finds no parallel legacy SDUI architecture.

---

## 37. Permanent Architecture Rules

The following rules are frozen.

1. **One SDUI engine owns SDUI presentation.**
2. **Domains never own SDUI screens.**
3. **API surfaces never build SDUI trees.**
4. **Composite models the hierarchy.**
5. **A small nested Builder DSL composes the hierarchy.**
6. **Builders are not created for ordinary configuration values.**
7. **Node definition and its exact properties are co-located.**
8. **One definition registry exists.**
9. **One canonical validator validates every final/published screen.**
10. **Screen composers contain only screen composition, not domain business rules.**
11. **ScreenRegistry resolves `(targetApp, screenId)` uniquely.**
12. **SduiService is the single public orchestration entry point.**
13. **Actions and themes use typed values/helpers.**
14. **No hidden current-parent state.**
15. **No screen-specific reusable primitive types.**
16. **No duplicate SDUI framework in Identity, Partner, Customer, API, Registry, or another package.**
17. **Compatibility code is temporary and must have proven callers.**
18. **Strict validation is never weakened to make migration easier.**
19. **Authentication/domain behavior is not redesigned as part of SDUI simplification.**
20. **A new abstraction must justify itself with a real invariant, stable boundary, or meaningful duplication reduction.**

---

## 38. Final Mental Model

A developer should remember only this:

```text
NODE DEFINITION
    tells us what a reusable UI type supports

        ↓

SDUI BUILDER
    builds a valid hierarchy

        ↓

SCREEN COMPOSER
    describes one real product screen

        ↓

SCREEN REGISTRY
    finds the correct screen composer

        ↓

SDUI SERVICE
    orchestrates build + validation

        ↓

SDUI VALIDATOR
    guarantees canonical output

        ↓

API
    returns the screen JSON
```

And the runtime ownership is:

```text
Business Domains                 SDUI Engine                  API
───────────────                  ───────────                  ───
Identity                         definitions                  route
Partner                          builder DSL       ←──        controller
Customer                         screens                       │
Booking                          registry                      │
Catalog                          validator                     │
Financials                       SduiService ──────────────────┘

business rules                   presentation                 transport
```

This is the architecture to implement.

Any future change that materially alters these ownership boundaries, hierarchy rules, core patterns, or public orchestration flow requires an explicit architecture decision before implementation.
