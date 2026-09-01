import { describe, expect, it } from 'vitest';
import { isValidSduiScreen, parseSduiScreen } from '../src/public/index.js';

const element = (id: string) => ({ id, type: 'text', properties: { text: id } });

const baseScreen = {
  screenId: 'home',
  templateId: 'home_template',
  templateType: 'default_template',
  schemaVersion: '3.0.0',
  targetApp: 'CUSTOMER' as const,
};

describe('canonical SDUI V3 hierarchy', () => {
  it('accepts Template -> Component -> Element', () => {
    const screen = {
      ...baseScreen,
      template: {
        id: 'home_template',
        type: 'default_template',
        components: [{ id: 'component-a', type: 'content', elements: [element('element-a')] }],
      },
    };

    expect(isValidSduiScreen(screen)).toBe(true);
    expect(parseSduiScreen(screen).template.components).toHaveLength(1);
  });

  it('accepts Template -> Component -> Section -> Element', () => {
    const screen = {
      ...baseScreen,
      template: {
        id: 'home_template',
        type: 'default_template',
        components: [{
          id: 'component-a',
          type: 'content',
          sections: [{ id: 'section-a', type: 'content', elements: [element('element-a')] }],
        }],
      },
    };

    expect(isValidSduiScreen(screen)).toBe(true);
  });

  it('accepts Template -> Component -> Section -> Group -> Element', () => {
    const screen = {
      ...baseScreen,
      template: {
        id: 'home_template',
        type: 'default_template',
        components: [{
          id: 'component-a',
          type: 'content',
          sections: [{
            id: 'section-a',
            type: 'content',
            groups: [{ id: 'group-a', type: 'row', elements: [element('element-a')] }],
          }],
        }],
      },
    };

    expect(isValidSduiScreen(screen)).toBe(true);
  });

  it('accepts multiple components using different valid hierarchy shapes', () => {
    const screen = {
      ...baseScreen,
      template: {
        id: 'home_template',
        type: 'default_template',
        components: [
          {
            id: 'component-direct',
            type: 'content',
            elements: [element('element-direct-1'), element('element-direct-2')],
          },
          {
            id: 'component-section',
            type: 'content',
            sections: [
              { id: 'section-direct-1', type: 'content', elements: [element('element-section-1')] },
              { id: 'section-direct-2', type: 'content', elements: [element('element-section-2')] },
            ],
          },
          {
            id: 'component-group',
            type: 'content',
            sections: [{
              id: 'section-group',
              type: 'content',
              groups: [
                { id: 'group-1', type: 'row', elements: [element('element-group-1')] },
                { id: 'group-2', type: 'row', elements: [element('element-group-2')] },
              ],
            }],
          },
        ],
      },
    };

    expect(parseSduiScreen(screen).template.components).toHaveLength(3);
  });

  it.each([
    ['zero components', {
      ...baseScreen,
      template: { id: 'home_template', type: 'default_template', components: [] },
    }],
    ['component with empty elements', {
      ...baseScreen,
      template: {
        id: 'home_template', type: 'default_template',
        components: [{ id: 'component-a', type: 'content', elements: [] }],
      },
    }],
    ['component with both elements and sections', {
      ...baseScreen,
      template: {
        id: 'home_template', type: 'default_template',
        components: [{
          id: 'component-a', type: 'content', elements: [element('element-a')],
          sections: [{ id: 'section-a', type: 'content', elements: [element('element-b')] }],
        }],
      },
    }],
    ['component with direct groups', {
      ...baseScreen,
      template: {
        id: 'home_template', type: 'default_template',
        components: [{
          id: 'component-a', type: 'content',
          groups: [{ id: 'group-a', type: 'row', elements: [element('element-a')] }],
        }],
      },
    }],
    ['section with both elements and groups', {
      ...baseScreen,
      template: {
        id: 'home_template', type: 'default_template',
        components: [{
          id: 'component-a', type: 'content',
          sections: [{
            id: 'section-a', type: 'content', elements: [element('element-a')],
            groups: [{ id: 'group-a', type: 'row', elements: [element('element-b')] }],
          }],
        }],
      },
    }],
    ['group with empty elements', {
      ...baseScreen,
      template: {
        id: 'home_template', type: 'default_template',
        components: [{
          id: 'component-a', type: 'content',
          sections: [{
            id: 'section-a', type: 'content',
            groups: [{ id: 'group-a', type: 'row', elements: [] }],
          }],
        }],
      },
    }],
    ['element with structural children', {
      ...baseScreen,
      template: {
        id: 'home_template', type: 'default_template',
        components: [{
          id: 'component-a', type: 'content',
          elements: [{ ...element('element-a'), elements: [element('nested')] }],
        }],
      },
    }],
    ['invalid target app', {
      ...baseScreen,
      targetApp: 'CUSTOMR',
      template: {
        id: 'home_template', type: 'default_template',
        components: [{ id: 'component-a', type: 'content', elements: [element('element-a')] }],
      },
    }],
  ])('rejects %s', (_name, screen) => {
    expect(isValidSduiScreen(screen)).toBe(false);
  });

  it('rejects mismatched template identity', () => {
    const screen = {
      ...baseScreen,
      template: {
        id: 'different_template',
        type: 'different_type',
        components: [{ id: 'component-a', type: 'content', elements: [element('element-a')] }],
      },
    };

    const result = (() => {
      try {
        parseSduiScreen(screen);
        return undefined;
      } catch (error) {
        return error;
      }
    })();

    expect(result).toBeDefined();
  });

  it('rejects duplicate structural IDs anywhere in a screen document', () => {
    const screen = {
      ...baseScreen,
      template: {
        id: 'home_template',
        type: 'default_template',
        components: [
          { id: 'component-a', type: 'content', elements: [element('duplicate-id')] },
          {
            id: 'component-b',
            type: 'content',
            sections: [{ id: 'section-a', type: 'content', elements: [element('duplicate-id')] }],
          },
        ],
      },
    };

    expect(isValidSduiScreen(screen)).toBe(false);
  });
});
