# SDUI UI SDK (`sdui/ui-sdk/`) — Migration Compatibility Source

> **Status:** LEGACY/MIGRATION SOURCE. New SDUI authoring architecture is owned by `sdui/engine` according to [`../SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`](../SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md).

`@carbroz/ui-sdk` currently retains stable wire models, schemas, validation and compatibility behavior used by existing code. It must not evolve as a second permanent authoring framework.

## Canonical active documents

- Final architecture + implementation sequence: [`../SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`](../SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md)
- Generic action/reference/destination wire contract: [`ACTION-CONTRACT.md`](./ACTION-CONTRACT.md)
- Partner Auth behavior: [`../PARTNER-AUTH-SDUI-CONTRACT.md`](../PARTNER-AUTH-SDUI-CONTRACT.md)

## Final ownership target

```text
sdui/engine
  → Screen / Template / Component / Section / Group / Element model
  → node definitions and canonical defaults
  → fluent hierarchy/property authoring
  → generic action/ref authoring
  → canonical validation
  → ScreenRegistry + SduiService

sdui/ui-sdk
  → temporary compatibility only until zero production references
```

## Frozen hierarchy

```text
Screen → Template → Component → Element
Screen → Template → Component → Section → Element
Screen → Template → Component → Section → Group → Element
```

XOR rules:

```text
Component → Elements XOR Sections
Section   → Elements XOR Groups
```

## Superseded authoring direction

The following older UI-SDK authoring style is **not** the target architecture:

```text
SduiScreenBuilder
addStackTemplate()
addStackComponent()
addStackSection()
addStackGroup()
TextBuilder / InputBuilder / ButtonBuilder families
returned child-builder graph as the primary public framework
```

Existing compatibility callers may remain temporarily, but no new production screen should be designed around that model.

## Final authoring direction

New/migrated screen composition uses the engine's small scoped DSL:

```ts
screen.template('stack_template', 'template_id', template => {
  template.base().spacing(24);

  template.component('stack_component', 'content', component => {
    component.base().padding(16);

    component.text('title', text => {
      text.content().text('Title');
      text.style().fontSize(24).fontWeight(700);
    });
  });
});
```

Hierarchy methods describe hierarchy. Reusable type is an explicit argument. Common terminal Elements may have convenience methods.

## Property model

The engine classifies properties into:

```text
base/default
style
content/instance
behavior
metadata/semantic
```

Node definitions own canonical defaults and exact schemas.

Rules:

- default properties are emitted automatically;
- screens omit defaults unless overriding them;
- non-default properties are emitted only when supplied;
- unknown properties are rejected;
- overrides are node-instance-local;
- nested default objects resolve deterministically;
- arrays replace rather than deep-merge element-by-element.

## Fluent property categories

Examples:

```ts
component.base().spacing(16).padding(24);
component.style().background('#FFFFFF');

text.content().text('Welcome');
text.style().fontSize(32).fontWeight(700);
text.metadata().contentDescription('Heading');

input.content().placeholder('98765 43210');
input.behavior().binding('mobileNumber').keyboardType('phone').required();
```

There must not be one unrestricted giant property bag available to every node.

## Action authoring

Final authoring namespace:

```ts
action.request(...)
action.navigate(...)
action.present(...)
action.dismiss(...)
action.state(...)
action.externalUri(...)
action.sequence(...)

ref.binding(...)
ref.context(...)
ref.response(...)
ref.literal(...)
```

Serialized action/reference meaning remains exactly the frozen wire contract in `ACTION-CONTRACT.md`.

Manual `$binding`/`$context`/`$response` object construction is forbidden in migrated screen composers.

## Validation

During migration the current UI-SDK parser may remain as a compatibility bridge, but final authority converges into the engine.

Defense in depth remains mandatory:

1. root structure;
2. hierarchy/XOR;
3. definition existence;
4. exact resolved properties;
5. action/event compatibility;
6. semantic invariants;
7. schema version;
8. target app;
9. publication validation where applicable.

Validation must never be weakened merely to simplify migration.

## Retirement condition

`@carbroz/ui-sdk` authoring/validation ownership may be retired only after:

- engine owns equivalent canonical contracts;
- all production screens use engine composition;
- API/domain screen builders have no production references;
- registry lifecycle consumes engine validation/contracts;
- full build/lint/test/coverage/freeze gates pass;
- repository search proves no required production imports remain.

Until then it is a compatibility source, not an alternative architecture.
