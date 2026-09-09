import { describe, expect, it } from 'vitest';
import {
  ButtonBuilder,
  ElementFactory,
  InputBuilder,
  StackComponentBuilder,
  StackGroupBuilder,
  StackSectionBuilder,
  StackTemplateBuilder,
  TextBuilder,
} from '../src/public/index.js';

describe('typed reusable SDUI builders', () => {
  it('maps semantic stack methods into canonical definition properties', () => {
    const text = new TextBuilder('title').value('Welcome').bold().build();
    const component = new StackComponentBuilder('content')
      .vertical()
      .spacing(16)
      .alignCenter()
      .fillMaxWidth()
      .addElement(text)
      .build();

    expect(component.type).toBe('stack_component');
    expect(component.properties).toMatchObject({
      orientation: 'vertical',
      verticalArrangement: { type: 'spacedBy', spacing: 16 },
      horizontalAlignment: 'center',
      fillMaxWidth: true,
    });
  });

  it('builds the canonical grouped hierarchy through typed reusable builders', () => {
    const countryCode = new TextBuilder('country_code', '+91').build();
    const phone = new InputBuilder('mobile_number')
      .phone()
      .maxLength(10)
      .weight(1)
      .bind('mobileNumber')
      .withValidation({ required: true })
      .build();

    const group = new StackGroupBuilder('mobile_group')
      .horizontal()
      .spacing(12)
      .addElement(countryCode)
      .addElement(phone)
      .build();

    const section = new StackSectionBuilder('mobile_section').addGroup(group).build();
    const component = new StackComponentBuilder('login_form').addSection(section).build();
    const template = new StackTemplateBuilder('login_template').addComponent(component).build();

    const firstComponent = template.components[0]!;
    expect('sections' in firstComponent).toBe(true);
    if (!('sections' in firstComponent)) throw new Error('Expected section branch');
    expect(firstComponent.sections[0]).toHaveProperty('groups');
  });

  it('rejects mixed component and section branches before final parsing', () => {
    const text = new TextBuilder('label', 'Label').build();
    const section = new StackSectionBuilder('section').addElement(text).build();
    const component = new StackComponentBuilder('component').addElement(text);
    expect(() => component.addSection(section)).toThrow(/both elements and sections/);

    const group = new StackGroupBuilder('group').addElement(text).build();
    const mixedSection = new StackSectionBuilder('mixed_section').addElement(text);
    expect(() => mixedSection.addGroup(group)).toThrow(/both elements and groups/);
  });

  it('preserves element interaction contracts while typing element properties', () => {
    const button = new ButtonBuilder('continue', 'Continue')
      .fillMaxWidth()
      .withActions({
        click: {
          type: 'navigate',
          payload: {
            screenId: 'next',
            templateId: 'next_template',
            templateType: 'default_template',
            endpoint: '/api/v1/partner/screen/next',
            method: 'GET',
            authentication: 'NONE',
          },
        },
      })
      .build();

    expect(button.properties).toMatchObject({ semanticRole: 'action', text: 'Continue', fillMaxWidth: true });
    expect(button.actions?.click?.type).toBe('navigate');
  });

  it('rejects unknown properties for registered production definitions', () => {
    expect(() => ElementFactory.create('button', {
      id: 'invalid_button',
      properties: { text: 'Continue', unsupportedProperty: true },
    })).toThrow();
  });
});
