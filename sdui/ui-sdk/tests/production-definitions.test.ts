import { describe, expect, it } from 'vitest';
import {
  ComponentFactory,
  CURRENT_SDUI_SCHEMA_VERSION,
  ElementFactory,
  GroupFactory,
  PRODUCTION_SDUI_DEFINITION_TYPES,
  ScreenBuilder,
  SectionFactory,
  TemplateFactory,
  componentRegistry,
  elementRegistry,
  groupRegistry,
  registerProductionSduiDefinitions,
  sectionRegistry,
  templateRegistry,
} from '../src/public/index.js';

describe('production SDUI definitions', () => {
  it('registers every canonical production definition exactly once', () => {
    registerProductionSduiDefinitions();
    registerProductionSduiDefinitions();

    for (const type of PRODUCTION_SDUI_DEFINITION_TYPES.elements) expect(elementRegistry.has(type)).toBe(true);
    for (const type of PRODUCTION_SDUI_DEFINITION_TYPES.groups) expect(groupRegistry.has(type)).toBe(true);
    for (const type of PRODUCTION_SDUI_DEFINITION_TYPES.sections) expect(sectionRegistry.has(type)).toBe(true);
    for (const type of PRODUCTION_SDUI_DEFINITION_TYPES.components) expect(componentRegistry.has(type)).toBe(true);
    for (const type of PRODUCTION_SDUI_DEFINITION_TYPES.templates) expect(templateRegistry.has(type)).toBe(true);
  });

  it('reuses a product-neutral element definition with independent ids and runtime data', () => {
    const first = ElementFactory.create('button', {
      id: 'continue',
      properties: { text: 'Continue' },
      actions: { click: { type: 'navigate', targetId: 'next' } },
      accessibility: { label: 'Continue' },
    });
    const second = ElementFactory.create('button', {
      id: 'book_now',
      properties: { text: 'Book now' },
    });

    expect(first.id).toBe('continue');
    expect(second.id).toBe('book_now');
    expect(first.type).toBe('button');
    expect(second.type).toBe('button');
    expect(first.properties.semanticRole).toBe('action');
    expect(first.properties.text).toBe('Continue');
    expect(first.actions?.click.targetId).toBe('next');
    expect(first.accessibility?.label).toBe('Continue');
  });

  it('creates groups only with non-empty element children', () => {
    const text = ElementFactory.create('text', { id: 'label', properties: { text: 'Name' } });
    const row = GroupFactory.create('row_group', { id: 'row', elements: [text] });

    expect(row.elements).toHaveLength(1);
    expect(row.properties?.axis).toBe('horizontal');
    expect(() => GroupFactory.create('row_group', { id: 'empty' })).toThrow(/at least one element/);
  });

  it('enforces exactly one legal section branch', () => {
    const text = ElementFactory.create('text', { id: 'label' });
    const row = GroupFactory.create('row_group', { id: 'row', elements: [text] });

    expect(SectionFactory.create('content_section', { id: 'elements_section', elements: [text] })).toHaveProperty('elements');
    expect(SectionFactory.create('content_section', { id: 'groups_section', groups: [row] })).toHaveProperty('groups');
    expect(() => SectionFactory.create('content_section', { id: 'empty' })).toThrow(/exactly one branch/);
    expect(() => SectionFactory.create('content_section', { id: 'mixed', elements: [text], groups: [row] })).toThrow(/exactly one branch/);
  });

  it('enforces exactly one legal component branch', () => {
    const text = ElementFactory.create('text', { id: 'label' });
    const section = SectionFactory.create('content_section', { id: 'section', elements: [text] });

    expect(ComponentFactory.create('content_component', { id: 'elements_component', elements: [text] })).toHaveProperty('elements');
    expect(ComponentFactory.create('content_component', { id: 'sections_component', sections: [section] })).toHaveProperty('sections');
    expect(() => ComponentFactory.create('content_component', { id: 'empty' })).toThrow(/exactly one branch/);
    expect(() => ComponentFactory.create('content_component', { id: 'mixed', elements: [text], sections: [section] })).toThrow(/exactly one branch/);
  });

  it('requires templates to receive at least one component', () => {
    const text = ElementFactory.create('text', { id: 'label' });
    const component = ComponentFactory.create('form_component', { id: 'form', elements: [text] });
    const template = TemplateFactory.create('form_template', { id: 'form_template_instance', components: [component] });

    expect(template.components).toHaveLength(1);
    expect(template.properties?.semanticRole).toBe('form');
    expect(() => TemplateFactory.create('form_template', { id: 'empty_template' })).toThrow(/at least one component/);
  });

  it('builds one screen mixing all three canonical hierarchy branches from production definitions', () => {
    const directText = ElementFactory.create('text', { id: 'direct_text', properties: { text: 'Direct' } });
    const direct = ComponentFactory.create('content_component', { id: 'direct', elements: [directText] });

    const sectionText = ElementFactory.create('text', { id: 'section_text', properties: { text: 'Section' } });
    const section = SectionFactory.create('content_section', { id: 'simple_section', elements: [sectionText] });
    const sectioned = ComponentFactory.create('content_component', { id: 'sectioned', sections: [section] });

    const groupText = ElementFactory.create('text', { id: 'group_text', properties: { text: 'Group' } });
    const group = GroupFactory.create('column_group', { id: 'group', elements: [groupText] });
    const groupedSection = SectionFactory.create('content_section', { id: 'grouped_section', groups: [group] });
    const grouped = ComponentFactory.create('content_component', { id: 'grouped', sections: [groupedSection] });

    const template = TemplateFactory.create('default_template', {
      id: 'mixed_template',
      components: [direct, sectioned, grouped],
    });
    const screen = new ScreenBuilder({
      screenId: 'production_definition_contract_test',
      schemaVersion: CURRENT_SDUI_SCHEMA_VERSION,
      targetApp: 'PARTNER',
    }).withTemplate(template).build();

    expect(screen.template.components).toHaveLength(3);
  });
});
