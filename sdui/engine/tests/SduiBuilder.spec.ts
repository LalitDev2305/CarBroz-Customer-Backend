import { describe, expect, it } from 'vitest';
import { SduiBuilder } from '../src/index.js';

const stackDefaults = {
  orientation: 'vertical',
  verticalArrangement: { type: 'spacedBy', spacing: 0 },
  padding: { start: 0, top: 0, end: 0, bottom: 0 },
};

describe('SduiBuilder frozen scoped setter DSL', () => {
  it('builds canonical hierarchy with typed creation methods and direct setters', () => {
    const screen = new SduiBuilder().screen('partner_login', 'PARTNER', $ =>
      $.stackTemplate('partner_login_template', $ =>
        $.setSpacing(24)
          .setPaddingTop(32)
          .stackComponent('login_content', $ =>
            $.stackSection('mobile_section', $ =>
              $.inputElement('mobile_number', $ =>
                $.setPlaceholder('98765 43210')
                  .setMaxLength(10)
                  .setKeyboardType('phone')
                  .setBinding('mobileNumber')
              )
            )
            .stackSection('actions', $ =>
              $.buttonElement('continue', $ => $.setText('Continue'))
            )
          )
      )
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
            properties: { semanticRole: 'action', text: 'Continue' },
          }],
        },
      ],
    });
  });

  it('deep merges nested defaults through direct setters', () => {
    const screen = new SduiBuilder().screen('screen', 'PARTNER', $ =>
      $.stackTemplate('template', $ =>
        $.setPaddingTop(18)
          .stackComponent('component', $ =>
            $.textElement('title', $ => $.setText('CarBroz'))
          )
      )
    );

    expect(screen.template.properties?.padding).toEqual({ start: 0, top: 18, end: 0, bottom: 0 });
  });

  it('supports scoped theme overrides without raw theme objects', () => {
    const screen = new SduiBuilder().screen('theme_screen', 'PARTNER', $ =>
      $.setTheme($ =>
        $.setStatusBar('default')
          .setGradientAngle(90)
      )
      .stackTemplate('template', $ =>
        $.stackComponent('component', $ =>
          $.textElement('title', $ => $.setText('CarBroz'))
        )
      )
    );

    expect(screen.theme).toMatchObject({
      theme: 'light',
      statusBar: 'default',
      properties: { gradient: { type: 'linear', angle: 90 } },
    });
  });

  it('supports screen-level schema version and metadata through setters', () => {
    const screen = new SduiBuilder().screen('screen_options', 'PARTNER', $ =>
      $.setSchemaVersion('9.9.9')
        .setMetadata({ source: 'coverage' })
        .stackTemplate('template', $ =>
          $.stackComponent('component', $ =>
            $.textElement('title', $ => $.setText('CarBroz'))
          )
        )
    );

    expect(screen.schemaVersion).toBe('9.9.9');
    expect(screen.metadata).toEqual({ source: 'coverage' });
  });

  it('rejects an unknown generic node definition', () => {
    expect(() => new SduiBuilder().screen('screen', 'PARTNER', $ =>
      $.setTemplate('unknown_template', 'template', $ =>
        $.stackComponent('component', $ =>
          $.textElement('title', $ => $.setText('CarBroz'))
        )
      )
    )).toThrow("SDUI definition 'unknown_template' is not registered at level 'template'");
  });

  it('rejects component elements mixed with sections in either order', () => {
    expect(() => new SduiBuilder().screen('screen', 'PARTNER', $ =>
      $.stackTemplate('template', $ =>
        $.stackComponent('component', $ =>
          $.textElement('title', $ => $.setText('CarBroz'))
            .stackSection('section', $ =>
              $.textElement('subtitle', $ => $.setText('Partner'))
            )
        )
      )
    )).toThrow('SDUI component cannot contain both elements and sections');

    expect(() => new SduiBuilder().screen('screen', 'PARTNER', $ =>
      $.stackTemplate('template', $ =>
        $.stackComponent('component', $ =>
          $.stackSection('section', $ =>
            $.textElement('subtitle', $ => $.setText('Partner'))
          )
          .textElement('title', $ => $.setText('CarBroz'))
        )
      )
    )).toThrow('SDUI component cannot contain both elements and sections');
  });

  it('rejects section elements mixed with groups in either order', () => {
    expect(() => new SduiBuilder().screen('screen', 'PARTNER', $ =>
      $.stackTemplate('template', $ =>
        $.stackComponent('component', $ =>
          $.stackSection('section', $ =>
            $.textElement('title', $ => $.setText('CarBroz'))
              .stackGroup('group', $ =>
                $.textElement('subtitle', $ => $.setText('Partner'))
              )
          )
        )
      )
    )).toThrow('SDUI section cannot contain both elements and groups');

    expect(() => new SduiBuilder().screen('screen', 'PARTNER', $ =>
      $.stackTemplate('template', $ =>
        $.stackComponent('component', $ =>
          $.stackSection('section', $ =>
            $.stackGroup('group', $ =>
              $.textElement('inside', $ => $.setText('Inside'))
            )
            .textElement('outside', $ => $.setText('Outside'))
          )
        )
      )
    )).toThrow('SDUI section cannot contain both elements and groups');
  });

  it('returns parent scope after child composition so sibling chaining is deterministic', () => {
    const screen = new SduiBuilder().screen('siblings', 'PARTNER', $ =>
      $.stackTemplate('template', $ =>
        $.stackComponent('component', $ =>
          $.textElement('first', $ => $.setText('First'))
            .textElement('second', $ => $.setText('Second'))
        )
      )
    );

    const component = screen.template.components[0]!;
    expect('elements' in component && component.elements.map(element => element.id)).toEqual(['first', 'second']);
  });

  it('rejects empty group, section, component, template and screen structures', () => {
    expect(() => new SduiBuilder().screen('screen', 'PARTNER', $ =>
      $.stackTemplate('template', $ =>
        $.stackComponent('component', $ =>
          $.stackSection('section', $ =>
            $.stackGroup('group', () => undefined)
          )
        )
      )
    )).toThrow("SDUI group 'group' requires at least one element");

    expect(() => new SduiBuilder().screen('screen', 'PARTNER', $ =>
      $.stackTemplate('template', $ =>
        $.stackComponent('component', $ =>
          $.stackSection('section', () => undefined)
        )
      )
    )).toThrow("SDUI section 'section' requires exactly one non-empty branch: elements or groups");

    expect(() => new SduiBuilder().screen('screen', 'PARTNER', $ =>
      $.stackTemplate('template', $ =>
        $.stackComponent('component', () => undefined)
      )
    )).toThrow("SDUI component 'component' requires exactly one non-empty branch: elements or sections");

    expect(() => new SduiBuilder().screen('screen', 'PARTNER', $ =>
      $.stackTemplate('template', () => undefined)
    )).toThrow("SDUI template 'template' requires at least one component");

    expect(() => new SduiBuilder().screen('screen', 'PARTNER', () => undefined))
      .toThrow("SDUI screen 'screen' requires exactly one template");
  });

  it('rejects a second template on the same screen', () => {
    expect(() => new SduiBuilder().screen('screen', 'PARTNER', $ =>
      $.stackTemplate('first', $ =>
        $.stackComponent('first_component', $ =>
          $.textElement('first_title', $ => $.setText('First'))
        )
      )
      .stackTemplate('second', $ =>
        $.stackComponent('second_component', $ =>
          $.textElement('second_title', $ => $.setText('Second'))
        )
      )
    )).toThrow('SDUI screen requires exactly one template');
  });
});
