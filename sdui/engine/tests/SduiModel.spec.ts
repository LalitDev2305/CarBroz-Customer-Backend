import { describe, expect, it } from 'vitest';
import {
  CURRENT_SDUI_SCHEMA_VERSION,
  SUPPORTED_SDUI_SCHEMA_VERSIONS,
  actionSchema,
  componentSchema,
  directElementSectionSchema,
  dynamicDestinationSchema,
  elementSchema,
  groupSchema,
  isSupportedSduiSchemaVersion,
  screenSchema,
  sectionSchema,
  templateSchema,
  themeSchema,
  valueReferenceSchema,
} from '../src/index.js';

const element = (id: string) => ({ id, type: 'text', properties: {} });

describe('canonical SDUI model schemas', () => {
  it('recognizes only supported schema versions', () => {
    expect(CURRENT_SDUI_SCHEMA_VERSION).toBe('3.0.0');
    expect(SUPPORTED_SDUI_SCHEMA_VERSIONS).toEqual(['3.0.0', '3.0']);
    expect(isSupportedSduiSchemaVersion('3.0.0')).toBe(true);
    expect(isSupportedSduiSchemaVersion('3.0')).toBe(true);
    expect(isSupportedSduiSchemaVersion('2.0')).toBe(false);
  });

  it('parses every canonical value reference and rejects malformed references', () => {
    expect(valueReferenceSchema.parse({ $binding: 'phone' })).toEqual({ $binding: 'phone' });
    expect(valueReferenceSchema.parse({ $literal: null })).toEqual({ $literal: null });
    expect(valueReferenceSchema.parse({ $response: 'data.id' })).toEqual({ $response: 'data.id' });
    expect(valueReferenceSchema.parse({ $context: 'deviceId' })).toEqual({ $context: 'deviceId' });
    expect(valueReferenceSchema.safeParse({ $binding: '' }).success).toBe(false);
    expect(valueReferenceSchema.safeParse({ unknown: 'x' }).success).toBe(false);
  });

  it('parses request body primitives, arrays, records, defaults and all action variants', () => {
    const request = actionSchema.parse({
      type: 'request',
      payload: {
        method: 'POST',
        endpoint: '/api/v1/example',
        authentication: 'SESSION',
        body: {
          binding: { $binding: 'phone' },
          text: 'x',
          number: 1,
          enabled: true,
          empty: null,
          list: [1, { $context: 'deviceId' }],
          nested: { response: { $response: 'data.id' } },
        },
      },
    });
    expect(request).toMatchObject({
      type: 'request',
      payload: { validate: false, responseMode: 'none' },
    });

    expect(actionSchema.parse({
      type: 'navigate',
      payload: {
        screenId: 'next', templateId: 'next_template', templateType: 'stack_template',
        endpoint: '/api/v1/screen/next', method: 'GET', authentication: 'NONE',
      },
    }).type).toBe('navigate');
    expect(actionSchema.parse({ type: 'present', targetId: 'dialog', payload: { presentation: 'bottom_sheet' } }).type).toBe('present');
    expect(actionSchema.parse({ type: 'dismiss' }).type).toBe('dismiss');
    expect(actionSchema.parse({ type: 'external_uri', payload: { uri: { $literal: 'https://example.com' } } }).type).toBe('external_uri');
    expect(actionSchema.parse({ type: 'sequence', payload: { actions: [{ type: 'dismiss', targetId: 'dialog' }] } }).type).toBe('sequence');
  });

  it('enforces state action set and toggle semantics', () => {
    expect(actionSchema.parse({
      type: 'state', targetId: 'field', payload: { operation: 'set', property: 'value', value: 'abc' },
    }).type).toBe('state');
    expect(actionSchema.parse({
      type: 'state', targetId: 'field', payload: { operation: 'toggle', property: 'visible' },
    }).type).toBe('state');

    expect(actionSchema.safeParse({
      type: 'state', targetId: 'field', payload: { operation: 'set', property: 'value' },
    }).success).toBe(false);
    expect(actionSchema.safeParse({
      type: 'state', targetId: 'field', payload: { operation: 'toggle', property: 'visible', value: true },
    }).success).toBe(false);
    expect(actionSchema.safeParse({
      type: 'state', targetId: 'field', payload: { operation: 'toggle', property: 'value' },
    }).success).toBe(false);
  });

  it('enforces strict destination and structural node contracts', () => {
    expect(dynamicDestinationSchema.safeParse({
      screenId: 'next', templateId: 'tpl', templateType: 'stack_template', endpoint: 'relative',
      method: 'GET', authentication: 'NONE',
    }).success).toBe(false);

    const directElement = elementSchema.parse({ id: 'title', type: 'text' });
    expect(directElement.properties).toEqual({});
    expect(elementSchema.safeParse({ ...directElement, unexpected: true }).success).toBe(false);

    const directGroup = groupSchema.parse({ id: 'group', type: 'stack_group', elements: [element('group_text')] });
    expect(directGroup.elements).toHaveLength(1);
    expect(groupSchema.safeParse({ id: 'group', type: 'stack_group', elements: [] }).success).toBe(false);

    const directSection = directElementSectionSchema.parse({ id: 'section', type: 'stack_section', elements: [element('section_text')] });
    expect(sectionSchema.parse(directSection)).toEqual(directSection);
    expect(sectionSchema.parse({ id: 'section', type: 'stack_section', groups: [directGroup] })).toMatchObject({ id: 'section' });

    expect(componentSchema.parse({ id: 'component', type: 'stack_component', elements: [element('component_text')] })).toMatchObject({ id: 'component' });
    expect(componentSchema.parse({ id: 'component', type: 'stack_component', sections: [directSection] })).toMatchObject({ id: 'component' });
    expect(componentSchema.safeParse({ id: 'component', type: 'stack_component', elements: [], sections: [] }).success).toBe(false);

    expect(templateSchema.parse({
      id: 'template', type: 'stack_template', components: [{ id: 'component', type: 'stack_component', elements: [element('text')] }],
    })).toMatchObject({ id: 'template' });
    expect(themeSchema.parse({ theme: 'dark', showBackButton: true, statusBar: 'transparent', properties: { spacing: 8 } })).toMatchObject({ theme: 'dark' });
  });

  it('walks all structural paths and rejects duplicate ids', () => {
    const directScreen = {
      screenId: 'direct', schemaVersion: '3.0.0', targetApp: 'PARTNER' as const,
      template: {
        id: 'direct_template', type: 'stack_template', components: [
          { id: 'direct_component', type: 'stack_component', elements: [element('direct_element')] },
        ],
      },
    };
    expect(screenSchema.parse(directScreen).screenId).toBe('direct');

    const sectionScreen = {
      screenId: 'section', schemaVersion: '3.0.0', targetApp: 'CUSTOMER' as const,
      template: {
        id: 'section_template', type: 'stack_template', components: [
          {
            id: 'section_component', type: 'stack_component', sections: [
              { id: 'direct_section', type: 'stack_section', elements: [element('section_element')] },
              {
                id: 'grouped_section', type: 'stack_section', groups: [
                  { id: 'group', type: 'stack_group', elements: [element('group_element')] },
                ],
              },
            ],
          },
        ],
      },
      theme: { theme: 'light' as const },
      metadata: { source: 'test' },
    };
    expect(screenSchema.parse(sectionScreen).screenId).toBe('section');

    expect(screenSchema.safeParse({
      ...directScreen,
      template: {
        ...directScreen.template,
        components: [{ id: 'direct_template', type: 'stack_component', elements: [element('other')] }],
      },
    }).success).toBe(false);
  });
});
