import { describe, expect, it } from 'vitest';
import {
  ComponentBuilder,
  ComponentFactory,
  ElementFactory,
  GroupBuilder,
  GroupFactory,
  ScreenBuilder,
  SectionBuilder,
  SectionFactory,
  TemplateBuilder,
  TemplateFactory,
  componentRegistry,
  elementRegistry,
  groupRegistry,
  sectionRegistry,
  templateRegistry,
  CURRENT_SDUI_SCHEMA_VERSION,
} from '../src/public/index.js';

const element = (id: string, type = 'text') => ElementFactory.raw({ id, type, properties: {} });

describe('SDUI composition engine', () => {
  it('supports all three legal component branches in one template', () => {
    const direct = new ComponentBuilder({ id: 'direct', type: 'direct_component' })
      .addElement(element('direct_text')).build();

    const section = new SectionBuilder({ id: 'simple_section', type: 'simple_section' })
      .addElement(element('section_text')).build();
    const sectioned = new ComponentBuilder({ id: 'sectioned', type: 'sectioned_component' })
      .addSection(section).build();

    const group = new GroupBuilder({ id: 'info_group', type: 'info_group' })
      .addElement(element('group_text')).build();
    const groupedSection = new SectionBuilder({ id: 'grouped_section', type: 'grouped_section' })
      .addGroup(group).build();
    const grouped = new ComponentBuilder({ id: 'grouped', type: 'grouped_component' })
      .addSection(groupedSection).build();

    const template = new TemplateBuilder({ id: 'dashboard_template_instance', type: 'dashboard_template' })
      .addComponent(direct).addComponent(sectioned).addComponent(grouped).build();

    const screen = new ScreenBuilder({
      screenId: 'dashboard', schemaVersion: CURRENT_SDUI_SCHEMA_VERSION, targetApp: 'CUSTOMER',
    }).withTemplate(template).build();

    expect(screen.template.components).toHaveLength(3);
  });

  it('rejects mixed component branches', () => {
    const builder = new ComponentBuilder({ id: 'mixed', type: 'mixed' }).addElement(element('a'));
    const section = new SectionBuilder({ id: 's', type: 's' }).addElement(element('b')).build();
    expect(() => builder.addSection(section)).toThrow(/both elements and sections/);
  });

  it('rejects mixed section branches', () => {
    const builder = new SectionBuilder({ id: 'mixed_section', type: 'mixed_section' }).addElement(element('a'));
    const group = new GroupBuilder({ id: 'g', type: 'g' }).addElement(element('b')).build();
    expect(() => builder.addGroup(group)).toThrow(/both elements and groups/);
  });

  it('reuses one registered element definition with different instance ids and data', () => {
    const type = 'test_primary_button';
    if (!elementRegistry.has(type)) {
      elementRegistry.register(type, ({ id, properties }) => ({
        id, type, properties: { semanticRole: 'primary_action', ...properties },
      }));
    }

    const login = ElementFactory.create(type, { id: 'login_continue', properties: { text: 'Continue' } });
    const dashboard = ElementFactory.create(type, { id: 'dashboard_book', properties: { text: 'Book Now' } });

    expect(login.type).toBe(type);
    expect(dashboard.type).toBe(type);
    expect(login.id).not.toBe(dashboard.id);
    expect(login.properties.text).toBe('Continue');
    expect(dashboard.properties.text).toBe('Book Now');
    expect(login.properties.semanticRole).toBe('primary_action');
  });

  it('reuses a registered component definition with different instance data', () => {
    const type = 'test_profile_header';
    if (!componentRegistry.has(type)) {
      componentRegistry.register(type, ({ id, properties }) => ({
        id,
        type,
        properties,
        elements: [
          { id: `${id}_title`, type: 'text', properties: { text: properties?.title } },
          { id: `${id}_subtitle`, type: 'text', properties: { text: properties?.subtitle } },
        ],
      }));
    }

    const login = ComponentFactory.create(type, {
      id: 'login_header', properties: { title: 'Welcome', subtitle: 'Login to continue' },
    });
    const dashboard = ComponentFactory.create(type, {
      id: 'dashboard_header', properties: { title: 'Hi', subtitle: 'Your dashboard' },
    });

    expect(login.type).toBe(dashboard.type);
    expect(login.id).not.toBe(dashboard.id);
    expect(login.properties?.title).toBe('Welcome');
    expect(dashboard.properties?.title).toBe('Hi');
  });

  /**
   * Reference demo for adding a new reusable SDUI hierarchy.
   *
   * Registration order is leaf -> parent:
   * Element -> Group -> Section -> Component -> Template.
   * Each parent creates its children through their registered factory, so the final
   * screen is composed only from canonical reusable definitions.
   */
  it('demonstrates how to register and return Template -> Component -> Section -> Group -> Element', () => {
    const elementType = 'test_demo_text';
    const groupType = 'test_demo_group';
    const sectionType = 'test_demo_section';
    const componentType = 'test_demo_component';
    const templateType = 'test_demo_template';

    if (!elementRegistry.has(elementType)) {
      elementRegistry.register(elementType, ({ id, properties }) => ({
        id,
        type: elementType,
        properties: {
          text: properties?.text ?? 'Demo element',
          style: 'body',
        },
      }));
    }

    if (!groupRegistry.has(groupType)) {
      groupRegistry.register(groupType, ({ id, properties }) => ({
        id,
        type: groupType,
        properties: { axis: 'horizontal', gap: 8 },
        elements: [
          ElementFactory.create(elementType, {
            id: `${id}_element`,
            properties: { text: properties?.text },
          }),
        ],
      }));
    }

    if (!sectionRegistry.has(sectionType)) {
      sectionRegistry.register(sectionType, ({ id, properties }) => ({
        id,
        type: sectionType,
        properties: { padding: 16 },
        groups: [
          GroupFactory.create(groupType, {
            id: `${id}_group`,
            properties,
          }),
        ],
      }));
    }

    if (!componentRegistry.has(componentType)) {
      componentRegistry.register(componentType, ({ id, properties }) => ({
        id,
        type: componentType,
        properties: { width: 'match_parent' },
        sections: [
          SectionFactory.create(sectionType, {
            id: `${id}_section`,
            properties,
          }),
        ],
      }));
    }

    if (!templateRegistry.has(templateType)) {
      templateRegistry.register(templateType, ({ id, properties }) => ({
        id,
        type: templateType,
        properties: { layout: 'column' },
        components: [
          ComponentFactory.create(componentType, {
            id: `${id}_component`,
            properties,
          }),
        ],
      }));
    }

    const template = TemplateFactory.create(templateType, {
      id: 'test_demo_template_instance',
      properties: { text: 'Hello from registered SDUI' },
    });

    const screen = new ScreenBuilder({
      screenId: 'test_demo_screen',
      schemaVersion: CURRENT_SDUI_SCHEMA_VERSION,
      targetApp: 'CUSTOMER',
    }).withTemplate(template).build();

    expect(screen).toEqual({
      screenId: 'test_demo_screen',
      schemaVersion: CURRENT_SDUI_SCHEMA_VERSION,
      targetApp: 'CUSTOMER',
      templateId: 'test_demo_template_instance',
      templateType: 'test_demo_template',
      template: {
        id: 'test_demo_template_instance',
        type: 'test_demo_template',
        properties: { layout: 'column' },
        components: [{
          id: 'test_demo_template_instance_component',
          type: 'test_demo_component',
          properties: { width: 'match_parent' },
          sections: [{
            id: 'test_demo_template_instance_component_section',
            type: 'test_demo_section',
            properties: { padding: 16 },
            groups: [{
              id: 'test_demo_template_instance_component_section_group',
              type: 'test_demo_group',
              properties: { axis: 'horizontal', gap: 8 },
              elements: [{
                id: 'test_demo_template_instance_component_section_group_element',
                type: 'test_demo_text',
                properties: {
                  text: 'Hello from registered SDUI',
                  style: 'body',
                },
              }],
            }],
          }],
        }],
      },
    });
  });
});
