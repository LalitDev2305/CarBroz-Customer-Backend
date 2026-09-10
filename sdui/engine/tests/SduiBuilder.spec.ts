import { describe, expect, it } from 'vitest';
import { SduiBuilder } from '../src/index.js';

const stackDefaults = {
  orientation: 'vertical',
  verticalArrangement: { type: 'spacedBy', spacing: 0 },
  padding: { start: 0, top: 0, end: 0, bottom: 0 },
};

describe('SduiBuilder', () => {
  it('builds the canonical hierarchy with automatic defaults and fluent overrides', () => {
    const screen = new SduiBuilder().screen(
      { id: 'partner_login', targetApp: 'PARTNER', theme: { theme: 'light', statusBar: 'transparent' } },
      root => {
        root.template('stack_template', 'partner_login_template', template => {
          template.base().spacing(24).paddingTop(32);
          template.component('stack_component', 'login_content', component => {
            component.section('stack_section', 'mobile_section', section => {
              section.input('mobile_number', input => {
                input.content().placeholder('98765 43210').maxLength(10);
                input.behavior().keyboardType('phone').binding('mobileNumber');
              });
            });
            component.section('stack_section', 'actions', section => {
              section.button('continue', button => button.content().text('Continue'));
            });
          });
        });
      },
    );

    expect(screen.screenId).toBe('partner_login');
    expect(screen.template.properties).toEqual({
      ...stackDefaults,
      verticalArrangement: { type: 'spacedBy', spacing: 24 },
      padding: { start: 0, top: 32, end: 0, bottom: 0 },
    });
    expect(screen.template.components[0]).toMatchObject({
      id: 'login_content',
      type: 'stack_component',
      properties: stackDefaults,
      sections: [
        {
          id: 'mobile_section',
          properties: stackDefaults,
          elements: [{
            id: 'mobile_number',
            type: 'input',
            properties: {
              semanticRole: 'input',
              placeholder: '98765 43210',
              keyboardType: 'phone',
              maxLength: 10,
            },
            binding: { key: 'mobileNumber' },
          }],
        },
      ],
    });
  });

  it('deep merges nested default properties instead of replacing them', () => {
    const screen = new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.base().paddingTop(18);
        template.component('stack_component', 'component', component => {
          component.text('title', text => text.content().text('CarBroz'));
        });
      });
    });
    expect(screen.template.properties?.padding).toEqual({ start: 0, top: 18, end: 0, bottom: 0 });
  });

  it('rejects an unknown node definition', () => {
    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('unknown_template', 'template', () => undefined);
    })).toThrow("SDUI definition 'unknown_template' is not registered at level 'template'");
  });

  it('rejects component elements mixed with sections', () => {
    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.component('stack_component', 'component', component => {
          component.text('title', text => text.content().text('CarBroz'));
          component.section('stack_section', 'section', section => {
            section.text('subtitle', text => text.content().text('Partner'));
          });
        });
      });
    })).toThrow('SDUI component cannot contain both elements and sections');
  });

  it('rejects section elements mixed with groups', () => {
    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.component('stack_component', 'component', component => {
          component.section('stack_section', 'section', section => {
            section.text('title', text => text.content().text('CarBroz'));
            section.group('stack_group', 'group', group => {
              group.text('subtitle', text => text.content().text('Partner'));
            });
          });
        });
      });
    })).toThrow('SDUI section cannot contain both elements and groups');
  });

  it('rejects empty structural containers', () => {
    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', () => undefined);
    })).toThrow("SDUI template 'template' requires at least one component");
  });
});
