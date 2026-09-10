import { describe, expect, it } from 'vitest';
import { NodeDefinitionRegistry, SduiBuilder } from '../src/index.js';

const emptyProperties = {
  parse(input: unknown): Record<string, unknown> {
    expect(input).toEqual({});
    return {};
  },
};

describe('SduiBuilder extensibility', () => {
  it('supports registered definitions without defaults and omits empty structural properties', () => {
    const definitions = new NodeDefinitionRegistry([
      {
        type: 'empty_template',
        level: 'template',
        properties: emptyProperties,
        children: 'components',
      },
      {
        type: 'empty_component',
        level: 'component',
        properties: emptyProperties,
        children: 'elements-or-sections',
      },
      {
        type: 'empty_element',
        level: 'element',
        properties: emptyProperties,
        children: 'none',
      },
    ]);

    const screen = new SduiBuilder(definitions).screen(
      { id: 'custom_screen', targetApp: 'PARTNER' },
      root => {
        root.template('empty_template', 'custom_template', template => {
          template.component('empty_component', 'custom_component', component => {
            component.element('empty_element', 'custom_element', {});
          });
        });
      },
    );

    expect(screen.template).not.toHaveProperty('properties');
    expect(screen.template.components[0]).not.toHaveProperty('properties');
    expect(screen.template.components[0]).toHaveProperty('elements.0.properties', {});
  });

  it('allows multiple groups in the same canonical section branch', () => {
    const screen = new SduiBuilder().screen(
      { id: 'multi_group_screen', targetApp: 'PARTNER' },
      root => {
        root.template('stack_template', 'template', template => {
          template.component('stack_component', 'component', component => {
            component.section('stack_section', 'section', section => {
              section.group('stack_group', 'first_group', group => {
                group.text('first_text', { text: 'First' });
              });
              section.group('stack_group', 'second_group', group => {
                group.text('second_text', { text: 'Second' });
              });
            });
          });
        });
      },
    );

    const component = screen.template.components[0]!;
    expect('sections' in component).toBe(true);
    if (!('sections' in component)) throw new Error('Expected section branch');
    const section = component.sections[0]!;
    expect('groups' in section).toBe(true);
    if (!('groups' in section)) throw new Error('Expected group branch');
    expect(section.groups.map((group) => group.id)).toEqual(['first_group', 'second_group']);
  });
});
