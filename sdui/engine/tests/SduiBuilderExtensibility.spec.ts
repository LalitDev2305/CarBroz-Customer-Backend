import { describe, expect, it } from 'vitest';
import { NodeDefinitionRegistry, SduiBuilder } from '../src/index.js';

const emptyProperties = {
  parse(input: unknown): Record<string, unknown> {
    expect(input).toEqual({});
    return {};
  },
};

describe('SduiBuilder extensibility', () => {
  it('supports registered definitions through generic set* escape hatches', () => {
    const definitions = new NodeDefinitionRegistry([
      { type: 'empty_template', level: 'template', properties: emptyProperties, children: 'components' },
      { type: 'empty_component', level: 'component', properties: emptyProperties, children: 'elements-or-sections' },
      { type: 'empty_element', level: 'element', properties: emptyProperties, children: 'none' },
    ]);

    const screen = new SduiBuilder(definitions).screen('custom_screen', 'PARTNER', $ =>
      $.setTemplate('empty_template', 'custom_template', $ =>
        $.setComponent('empty_component', 'custom_component', $ =>
          $.setElement('empty_element', 'custom_element', () => undefined)
        )
      )
    );

    expect(screen.template).not.toHaveProperty('properties');
    expect(screen.template.components[0]).not.toHaveProperty('properties');
    expect(screen.template.components[0]).toHaveProperty('elements.0.properties', {});
  });

  it('allows multiple groups in the same canonical section branch', () => {
    const screen = new SduiBuilder().screen('multi_group_screen', 'PARTNER', $ =>
      $.stackTemplate('template', $ =>
        $.stackComponent('component', $ =>
          $.stackSection('section', $ =>
            $.stackGroup('first_group', $ =>
              $.textElement('first_text', $ => $.setText('First'))
            )
            .stackGroup('second_group', $ =>
              $.textElement('second_text', $ => $.setText('Second'))
            )
          )
        )
      )
    );

    const component = screen.template.components[0]!;
    expect('sections' in component).toBe(true);
    if (!('sections' in component)) throw new Error('Expected section branch');
    const section = component.sections[0]!;
    expect('groups' in section).toBe(true);
    if (!('groups' in section)) throw new Error('Expected group branch');
    expect(section.groups.map(group => group.id)).toEqual(['first_group', 'second_group']);
  });
});
