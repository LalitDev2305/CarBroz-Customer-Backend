import { describe, expect, it } from 'vitest';
import {
  BaseSduiScreenBuilder,
  ButtonBuilder,
  ComponentBuilder,
  CURRENT_SDUI_SCHEMA_VERSION,
  ElementFactory,
  GroupBuilder,
  RequestActionBuilder,
  SduiThemeBuilder,
  SectionBuilder,
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

  it('rejects reverse-order mixing in the generic compatibility hierarchy builders', () => {
    const text = ElementFactory.create('text', { id: 'text', properties: { text: 'Text' } });
    const secondText = ElementFactory.create('text', { id: 'second_text', properties: { text: 'Second' } });

    const group = new GroupBuilder({ id: 'group', type: 'stack_group' })
      .addElement(text)
      .build();
    const sectionWithGroup = new SectionBuilder({ id: 'section_with_group', type: 'stack_section' })
      .addGroup(group);
    expect(() => sectionWithGroup.addElement(secondText)).toThrow(/both elements and groups/);

    const section = new SectionBuilder({ id: 'section', type: 'stack_section' })
      .addElement(text)
      .build();
    const componentWithSection = new ComponentBuilder({ id: 'component_with_section', type: 'stack_component' })
      .addSection(section);
    expect(() => componentWithSection.addElement(secondText)).toThrow(/both elements and sections/);
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

  it('serializes all optional typed element extras through the compatibility facade', () => {
    const button = new ButtonBuilder('rich_button', 'Rich')
      .withAnalytics({ event: 'tap' })
      .withAccessibility({ label: 'Rich button' })
      .withVisibility({ visible: true })
      .withMetadata({ source: 'coverage' })
      .build();

    expect(button.analytics).toEqual({ event: 'tap' });
    expect(button.accessibility).toEqual({ label: 'Rich button' });
    expect(button.visibility).toEqual({ visible: true });
    expect(button.metadata).toEqual({ source: 'coverage' });
  });

  it('fails fast for incomplete request actions and omits an empty request body', () => {
    expect(() => new RequestActionBuilder().build()).toThrow(/method/);
    expect(() => new RequestActionBuilder().method('POST').build()).toThrow(/endpoint/);
    expect(() => new RequestActionBuilder().method('POST').endpoint('/api/v1/test').build()).toThrow(/authentication/);

    expect(new RequestActionBuilder()
      .method('GET')
      .endpoint('/api/v1/test')
      .authentication('NONE')
      .build()).toEqual({
      type: 'request',
      payload: {
        method: 'GET',
        endpoint: '/api/v1/test',
        authentication: 'NONE',
        validate: false,
        responseMode: 'none',
      },
    });
  });

  it('covers optional theme omission and explicit false back-button authoring', () => {
    expect(new SduiThemeBuilder().build()).toEqual({});
    expect(new SduiThemeBuilder().showBackButton(false).build()).toEqual({ showBackButton: false });
  });

  it('fails fast for missing root screen identity fields and preserves metadata', () => {
    expect(() => new BaseSduiScreenBuilder().build()).toThrow(/screen id/);
    expect(() => new BaseSduiScreenBuilder().id('screen').build()).toThrow(/schema version/);
    expect(() => new BaseSduiScreenBuilder()
      .id('screen')
      .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
      .build()).toThrow(/target app/);

    const screen = new BaseSduiScreenBuilder({
      screenId: 'metadata_screen',
      schemaVersion: CURRENT_SDUI_SCHEMA_VERSION,
      targetApp: 'PARTNER',
      metadata: { source: 'coverage' },
    });
    screen.addStackTemplate('template').addStackComponent('component').addText('text', 'Text');
    expect(screen.build().metadata).toEqual({ source: 'coverage' });
  });

  it('rejects unknown properties for registered production definitions', () => {
    expect(() => ElementFactory.create('button', {
      id: 'invalid_button',
      properties: { text: 'Continue', unsupportedProperty: true },
    })).toThrow();
  });
});
