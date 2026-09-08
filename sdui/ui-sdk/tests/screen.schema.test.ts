import { describe, expect, it } from 'vitest';
import { isValidSduiScreen, parseSduiScreen } from '../src/public/index.js';

const element = (id: string) => ({ id, type: 'text', properties: { text: id } });
const baseScreen = { screenId: 'home', schemaVersion: '3.0.0', targetApp: 'CUSTOMER' as const };
const directTemplate = () => ({ id: 'tpl_7K2M9Q', type: 'default_template', components: [{ id: 'component-a', type: 'content', elements: [element('element-a')] }] });

describe('canonical SDUI V3 hierarchy', () => {
  it('accepts Template -> Component -> Element', () => {
    const screen = { ...baseScreen, template: directTemplate() };
    expect(isValidSduiScreen(screen)).toBe(true);
    expect(parseSduiScreen(screen).template.components).toHaveLength(1);
  });

  it('accepts Template -> Component -> Section -> Element', () => {
    const screen = { ...baseScreen, template: { id: 'tpl_7K2M9Q', type: 'default_template', components: [{ id: 'component-a', type: 'content', sections: [{ id: 'section-a', type: 'content', elements: [element('element-a')] }] }] } };
    expect(isValidSduiScreen(screen)).toBe(true);
  });

  it('accepts Template -> Component -> Section -> Group -> Element', () => {
    const screen = { ...baseScreen, template: { id: 'tpl_7K2M9Q', type: 'default_template', components: [{ id: 'component-a', type: 'content', sections: [{ id: 'section-a', type: 'content', groups: [{ id: 'group-a', type: 'row', elements: [element('element-a')] }] }] }] } };
    expect(isValidSduiScreen(screen)).toBe(true);
  });

  it('rejects duplicate template identity at the loaded Screen root', () => {
    expect(isValidSduiScreen({ ...baseScreen, templateId: 'tpl_7K2M9Q', templateType: 'default_template', template: directTemplate() })).toBe(false);
  });

  it('rejects duplicate structural IDs anywhere in a screen document', () => {
    const screen = { ...baseScreen, template: { id: 'tpl_7K2M9Q', type: 'default_template', components: [
      { id: 'component-a', type: 'content', elements: [element('duplicate-id')] },
      { id: 'component-b', type: 'content', sections: [{ id: 'section-a', type: 'content', elements: [element('duplicate-id')] }] },
    ] } };
    expect(isValidSduiScreen(screen)).toBe(false);
  });

  it.each([
    ['zero components', { ...baseScreen, template: { id: 'tpl_7K2M9Q', type: 'default_template', components: [] } }],
    ['component with empty elements', { ...baseScreen, template: { id: 'tpl_7K2M9Q', type: 'default_template', components: [{ id: 'component-a', type: 'content', elements: [] }] } }],
    ['component with both branches', { ...baseScreen, template: { id: 'tpl_7K2M9Q', type: 'default_template', components: [{ id: 'component-a', type: 'content', elements: [element('element-a')], sections: [{ id: 'section-a', type: 'content', elements: [element('element-b')] }] }] } }],
    ['component with direct groups', { ...baseScreen, template: { id: 'tpl_7K2M9Q', type: 'default_template', components: [{ id: 'component-a', type: 'content', groups: [{ id: 'group-a', type: 'row', elements: [element('element-a')] }] }] } }],
    ['invalid target app', { ...baseScreen, targetApp: 'CUSTOMR', template: directTemplate() }],
  ])('rejects %s', (_name, screen) => expect(isValidSduiScreen(screen)).toBe(false));
});
