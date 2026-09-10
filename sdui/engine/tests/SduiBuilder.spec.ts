import { describe, expect, it } from 'vitest';
import { SduiBuilder } from '../src/index.js';

describe('SduiBuilder', () => {
  it('builds the canonical nested hierarchy and applies definition defaults', () => {
    const screen = new SduiBuilder().screen(
      {
        id: 'partner_login',
        targetApp: 'PARTNER',
        theme: { theme: 'light', statusBar: 'transparent' },
      },
      root => {
        root.template('stack_template', 'partner_login_template', {}, template => {
          template.component('stack_component', 'login_content', {}, component => {
            component.section('stack_section', 'mobile_section', {}, section => {
              section.input('mobile_number', {
                placeholder: '98765 43210',
                keyboardType: 'phone',
                maxLength: 10,
              }, {
                binding: { key: 'mobileNumber' },
              });
            });

            component.section('stack_section', 'actions', {}, section => {
              section.button('continue', { text: 'Continue' });
            });
          });
        });
      },
    );

    expect(screen.screenId).toBe('partner_login');
    expect(screen.targetApp).toBe('PARTNER');
    expect(screen.template).toEqual({
      id: 'partner_login_template',
      type: 'stack_template',
      properties: { orientation: 'vertical' },
      components: [
        {
          id: 'login_content',
          type: 'stack_component',
          properties: { orientation: 'vertical' },
          sections: [
            {
              id: 'mobile_section',
              type: 'stack_section',
              properties: { orientation: 'vertical' },
              elements: [
                {
                  id: 'mobile_number',
                  type: 'input',
                  properties: {
                    semanticRole: 'input',
                    placeholder: '98765 43210',
                    keyboardType: 'phone',
                    maxLength: 10,
                  },
                  binding: { key: 'mobileNumber' },
                },
              ],
            },
            {
              id: 'actions',
              type: 'stack_section',
              properties: { orientation: 'vertical' },
              elements: [
                {
                  id: 'continue',
                  type: 'button',
                  properties: { semanticRole: 'action', text: 'Continue' },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('rejects an unknown node definition', () => {
    expect(() =>
      new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
        root.template('unknown_template', 'template', {}, () => undefined);
      }),
    ).toThrow("SDUI definition 'unknown_template' is not registered at level 'template'");
  });

  it('rejects component elements mixed with sections', () => {
    expect(() =>
      new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
        root.template('stack_template', 'template', {}, template => {
          template.component('stack_component', 'component', {}, component => {
            component.text('title', { text: 'CarBroz' });
            component.section('stack_section', 'section', {}, section => {
              section.text('subtitle', { text: 'Partner' });
            });
          });
        });
      }),
    ).toThrow('SDUI component cannot contain both elements and sections');
  });

  it('rejects section elements mixed with groups', () => {
    expect(() =>
      new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
        root.template('stack_template', 'template', {}, template => {
          template.component('stack_component', 'component', {}, component => {
            component.section('stack_section', 'section', {}, section => {
              section.text('title', { text: 'CarBroz' });
              section.group('stack_group', 'group', {}, group => {
                group.text('subtitle', { text: 'Partner' });
              });
            });
          });
        });
      }),
    ).toThrow('SDUI section cannot contain both elements and groups');
  });

  it('rejects empty structural containers', () => {
    expect(() =>
      new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
        root.template('stack_template', 'template', {}, () => undefined);
      }),
    ).toThrow("SDUI template 'template' requires at least one component");
  });
});
