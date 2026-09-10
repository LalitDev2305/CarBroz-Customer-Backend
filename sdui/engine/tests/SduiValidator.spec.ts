import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import {
  NodeDefinitionRegistry,
  SduiValidator,
  createProductionNodeDefinitionRegistry,
  type NodeDefinition,
  type SduiContentMode,
  type SduiNodeLevel,
  type SduiScreen,
} from '../src/index.js';

const productionScreen = (): SduiScreen => ({
  screenId: 'validator_screen',
  schemaVersion: '3.0.0',
  targetApp: 'PARTNER',
  template: {
    id: 'validator_template',
    type: 'stack_template',
    components: [{
      id: 'validator_component',
      type: 'stack_component',
      sections: [
        {
          id: 'direct_section',
          type: 'stack_section',
          elements: [{ id: 'direct_text', type: 'text', properties: { text: 'Direct' } }],
        },
        {
          id: 'grouped_section',
          type: 'stack_section',
          groups: [{
            id: 'validator_group',
            type: 'stack_group',
            elements: [{ id: 'group_text', type: 'text', properties: { text: 'Grouped' } }],
          }],
        },
      ],
    }],
  },
});

const definition = (
  level: SduiNodeLevel,
  type: string,
  children: SduiContentMode,
  supportedEvents?: NodeDefinition['supportedEvents'],
): NodeDefinition => ({
  level,
  type,
  children,
  properties: z.record(z.string(), z.unknown()),
  ...(supportedEvents === undefined ? {} : { supportedEvents }),
});

const registryFor = (overrides: Partial<Record<SduiNodeLevel, SduiContentMode>> = {}): NodeDefinitionRegistry => new NodeDefinitionRegistry([
  definition('template', 'stack_template', overrides.template ?? 'components'),
  definition('component', 'stack_component', overrides.component ?? 'elements-or-sections'),
  definition('section', 'stack_section', overrides.section ?? 'elements-or-groups'),
  definition('group', 'stack_group', overrides.group ?? 'elements'),
  definition('element', 'text', overrides.element ?? 'none'),
]);

describe('SduiValidator canonical runtime boundary', () => {
  it('validates all supported hierarchy paths with production definitions', () => {
    const validator = new SduiValidator();
    expect(validator.validate(productionScreen())).toMatchObject({ screenId: 'validator_screen' });

    const directComponent: SduiScreen = {
      ...productionScreen(),
      template: {
        id: 'direct_template', type: 'stack_template', components: [{
          id: 'direct_component', type: 'stack_component',
          elements: [{ id: 'button', type: 'button', properties: { text: 'Continue' }, actions: {
            onClick: { type: 'dismiss' },
          } }],
        }],
      },
    };
    expect(validator.validate(directComponent)).toMatchObject({ screenId: 'validator_screen' });
  });

  it('rejects unsupported schema versions after wire parsing', () => {
    const screen = { ...productionScreen(), schemaVersion: '9.0.0' };
    expect(() => new SduiValidator().validate(screen)).toThrow("Unsupported SDUI schema version '9.0.0'");
  });

  it.each([
    ['template', { template: 'none' }, "SDUI template 'stack_template' cannot own components"],
    ['component', { component: 'none' }, "SDUI component 'stack_component' has invalid child capability 'none'"],
    ['section', { section: 'none' }, "SDUI section 'stack_section' has invalid child capability 'none'"],
    ['group', { group: 'none' }, "SDUI group 'stack_group' cannot own elements"],
    ['element', { element: 'elements' }, "SDUI element 'text' must be terminal"],
  ] as const)('rejects invalid %s child capabilities', (_level, overrides, message) => {
    expect(() => new SduiValidator(registryFor(overrides)).validate(productionScreen())).toThrow(message);
  });

  it('rejects events not declared by the element definition', () => {
    const screen: SduiScreen = {
      screenId: 'event_screen', schemaVersion: '3.0.0', targetApp: 'PARTNER',
      template: {
        id: 'event_template', type: 'stack_template', components: [{
          id: 'event_component', type: 'stack_component', elements: [{
            id: 'event_text', type: 'text', properties: {},
            actions: { onClick: { type: 'dismiss' } },
          }],
        }],
      },
    };
    expect(() => new SduiValidator(registryFor()).validate(screen))
      .toThrow("SDUI element 'event_text' of type 'text' does not support event 'onClick'");
  });

  it('accepts declared element events with an explicit custom registry', () => {
    const registry = registryFor();
    const withEvents = new NodeDefinitionRegistry([
      definition('template', 'stack_template', 'components'),
      definition('component', 'stack_component', 'elements-or-sections'),
      definition('section', 'stack_section', 'elements-or-groups'),
      definition('group', 'stack_group', 'elements'),
      definition('element', 'text', 'none', ['onClick']),
    ]);
    expect(registry.has('element', 'text')).toBe(true);

    const screen: SduiScreen = {
      screenId: 'event_screen', schemaVersion: '3.0.0', targetApp: 'PARTNER',
      template: {
        id: 'event_template', type: 'stack_template', components: [{
          id: 'event_component', type: 'stack_component', elements: [{
            id: 'event_text', type: 'text', properties: {},
            actions: { onClick: { type: 'dismiss' } },
          }],
        }],
      },
    };
    expect(new SduiValidator(withEvents).validate(screen).screenId).toBe('event_screen');
  });

  it('delegates property parsing to the registered node definition', () => {
    const definitions = createProductionNodeDefinitionRegistry();
    const invalid: SduiScreen = {
      screenId: 'invalid_props', schemaVersion: '3.0.0', targetApp: 'PARTNER',
      template: {
        id: 'template', type: 'stack_template', components: [{
          id: 'component', type: 'stack_component',
          elements: [{ id: 'text', type: 'text', properties: { definitelyUnknown: true } }],
        }],
      },
    };
    expect(() => new SduiValidator(definitions).validate(invalid)).toThrow();
  });
});
