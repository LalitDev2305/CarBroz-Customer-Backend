import { describe, expect, it } from 'vitest';
import {
  BaseSduiScreenBuilder,
  ButtonBuilder,
  CURRENT_SDUI_SCHEMA_VERSION,
  ElementFactory,
  StackComponentBuilder,
} from '../src/public/index.js';

describe('typed reusable SDUI object-graph builders', () => {
  it('maps semantic stack methods into canonical definition properties', () => {
    const component = new StackComponentBuilder('content')
      .vertical()
      .spacing(16)
      .alignCenter()
      .fillMaxWidth();

    component.addText('title', 'Welcome').bold();
    const built = component.build();

    expect(built.type).toBe('stack_component');
    expect(built.properties).toMatchObject({
      orientation: 'vertical',
      verticalArrangement: { type: 'spacedBy', spacing: 16 },
      horizontalAlignment: 'center',
      fillMaxWidth: true,
    });
  });

  it('builds the canonical hierarchy by parent objects owning child builders', () => {
    const screen = new BaseSduiScreenBuilder({
      screenId: 'object_graph_contract',
      schemaVersion: CURRENT_SDUI_SCHEMA_VERSION,
      targetApp: 'PARTNER',
    });
    const template = screen.addStackTemplate('login_template');
    const component = template.addStackComponent('login_form');
    const section = component.addStackSection('mobile_section');
    const group = section.addStackGroup('mobile_group');

    group.addText('country_code', '+91');
    group.addInput('mobile_number')
      .phone()
      .maxLength(10)
      .weight(1)
      .bind('mobileNumber')
      .required();

    const built = screen.build();
    const firstComponent = built.template.components[0]!;
    expect('sections' in firstComponent).toBe(true);
    if (!('sections' in firstComponent)) throw new Error('Expected section branch');
    expect(firstComponent.sections[0]).toHaveProperty('groups');
  });

  it('keeps multiple component child ownership unambiguous', () => {
    const screen = new BaseSduiScreenBuilder({
      screenId: 'multiple_components',
      schemaVersion: CURRENT_SDUI_SCHEMA_VERSION,
      targetApp: 'PARTNER',
    });
    const template = screen.addStackTemplate('template');
    const component1 = template.addStackComponent('component_1');
    const component2 = template.addStackComponent('component_2');
    const component3 = template.addStackComponent('component_3');

    component1.addText('first_text', 'First');
    const section = component2.addStackSection('second_section');
    section.addText('second_text', 'Second');
    component3.addText('third_text', 'Third');

    const built = screen.build();
    expect(built.template.components[0]).toHaveProperty('elements.0.id', 'first_text');
    expect(built.template.components[1]).toHaveProperty('sections.0.elements.0.id', 'second_text');
    expect(built.template.components[2]).toHaveProperty('elements.0.id', 'third_text');
  });

  it('rejects mixed component and section branches immediately on the exact parent', () => {
    const component = new StackComponentBuilder('component');
    component.addText('label', 'Label');
    expect(() => component.addStackSection('section')).toThrow(/both elements and sections/);

    const sectionOwner = new StackComponentBuilder('section_owner');
    const section = sectionOwner.addStackSection('mixed_section');
    section.addText('section_label', 'Label');
    expect(() => section.addStackGroup('group')).toThrow(/both elements and groups/);
  });

  it('preserves element interaction contracts while typing element properties', () => {
    const button = new ButtonBuilder('continue', 'Continue')
      .fillMaxWidth()
      .onClick({
        type: 'navigate',
        payload: {
          screenId: 'next',
          templateId: 'next_template',
          templateType: 'default_template',
          endpoint: '/api/v1/partner/screen/next',
          method: 'GET',
          authentication: 'NONE',
        },
      })
      .build();

    expect(button.properties).toMatchObject({ semanticRole: 'action', text: 'Continue', fillMaxWidth: true });
    expect(button.actions?.onClick?.type).toBe('navigate');
  });

  it('rejects unknown properties for registered production definitions', () => {
    expect(() => ElementFactory.create('button', {
      id: 'invalid_button',
      properties: { text: 'Continue', unsupportedProperty: true },
    })).toThrow();
  });
});
