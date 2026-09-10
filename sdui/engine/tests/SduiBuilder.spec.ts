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
          type: 'stack_section',
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
        {
          id: 'actions',
          type: 'stack_section',
          properties: stackDefaults,
          elements: [{
            id: 'continue',
            type: 'button',
            properties: {
              semanticRole: 'action',
              text: 'Continue',
            },
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
      root.template('unknown_template', 'template', template => {
        template.component('stack_component', 'component', component => {
          component.text('title', text => text.content().text('CarBroz'));
        });
      });
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

  it('rejects sections followed by direct component elements', () => {
    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.component('stack_component', 'component', component => {
          component.section('stack_section', 'section', section => {
            section.text('subtitle', { text: 'Partner' });
          });
          component.text('title', { text: 'CarBroz' });
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

  it('rejects groups followed by direct section elements', () => {
    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.component('stack_component', 'component', component => {
          component.section('stack_section', 'section', section => {
            section.group('stack_group', 'group', group => {
              group.text('inside', { text: 'Inside' });
            });
            section.text('outside', { text: 'Outside' });
          });
        });
      });
    })).toThrow('SDUI section cannot contain both elements and groups');
  });

  it('builds property overloads, grouped content, element extras and explicit screen options', () => {
    const screen = new SduiBuilder().screen({
      id: 'overloads',
      targetApp: 'PARTNER',
      schemaVersion: '9.9.9',
      metadata: { source: 'coverage' },
    }, root => {
      root.template('stack_template', 'template', { orientation: 'horizontal' }, template => {
        template.component('stack_component', 'component', { orientation: 'horizontal' }, component => {
          component.section('stack_section', 'section', { orientation: 'horizontal' }, section => {
            section.group('stack_group', 'group', { orientation: 'horizontal' }, group => {
              group.text('text', { text: 'Text' }, { metadata: { kind: 'text' } });
              group.image('image', { url: 'https://example.invalid/image.png' }, { accessibility: { label: 'Image' } });
              group.input('input', { placeholder: 'Input' }, { validation: { required: true } });
              group.button('button', { text: 'Button' }, { analytics: { event: 'tap' } });
            });
          });
        });
      });
    });

    expect(screen.schemaVersion).toBe('9.9.9');
    expect(screen.metadata).toEqual({ source: 'coverage' });
    const group = screen.template.components[0]?.sections?.[0]?.groups?.[0];
    expect(group?.elements).toHaveLength(4);
    expect(group?.elements[0]?.metadata).toEqual({ kind: 'text' });
    expect(group?.elements[1]?.accessibility).toEqual({ label: 'Image' });
    expect(group?.elements[2]?.validation).toEqual({ required: true });
    expect(group?.elements[3]?.analytics).toEqual({ event: 'tap' });
  });

  it('covers fluent image, text, input and button element helpers including metadata', () => {
    const screen = new SduiBuilder().screen({ id: 'helpers', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.component('stack_component', 'component', component => {
          component.text('text', node => {
            node.content().text('Text');
            node.metadata().metadata({ kind: 'copy' });
          });
          component.image('image', node => node.content().url('https://example.invalid/image.png'));
          component.input('input', node => node.content().placeholder('Input'));
          component.button('button', node => node.content().text('Button'));
        });
      });
    });

    expect(screen.template.components[0]?.elements).toHaveLength(4);
  });

  it('rejects every property overload that omits its required composition callback', () => {
    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', {} as Record<string, unknown>);
    })).toThrow("SDUI template 'template' requires a composition callback");

    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.component('stack_component', 'component', {} as Record<string, unknown>);
      });
    })).toThrow("SDUI component 'component' requires a composition callback");

    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.component('stack_component', 'component', component => {
          component.section('stack_section', 'section', {} as Record<string, unknown>);
        });
      });
    })).toThrow("SDUI section 'section' requires a composition callback");

    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.component('stack_component', 'component', component => {
          component.section('stack_section', 'section', section => {
            section.group('stack_group', 'group', {} as Record<string, unknown>);
          });
        });
      });
    })).toThrow("SDUI group 'group' requires a composition callback");
  });

  it('rejects empty group, section, component and screen structures', () => {
    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.component('stack_component', 'component', component => {
          component.section('stack_section', 'section', section => {
            section.group('stack_group', 'group', () => undefined);
          });
        });
      });
    })).toThrow("SDUI group 'group' requires at least one element");

    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.component('stack_component', 'component', component => {
          component.section('stack_section', 'section', () => undefined);
        });
      });
    })).toThrow("SDUI section 'section' requires exactly one non-empty branch: elements or groups");

    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', template => {
        template.component('stack_component', 'component', () => undefined);
      });
    })).toThrow("SDUI component 'component' requires exactly one non-empty branch: elements or sections");

    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, () => undefined))
      .toThrow("SDUI screen 'screen' requires exactly one template");
  });

  it('rejects a second template on the same screen', () => {
    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      const compose = (template: Parameters<Parameters<typeof root.template>[2]>[0]) => {
        template.component('stack_component', 'component', component => {
          component.text('title', { text: 'CarBroz' });
        });
      };
      root.template('stack_template', 'first', compose);
      root.template('stack_template', 'second', compose);
    })).toThrow('SDUI screen requires exactly one template');
  });

  it('rejects empty structural containers', () => {
    expect(() => new SduiBuilder().screen({ id: 'screen', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template', () => undefined);
    })).toThrow("SDUI template 'template' requires at least one component");
  });
});
