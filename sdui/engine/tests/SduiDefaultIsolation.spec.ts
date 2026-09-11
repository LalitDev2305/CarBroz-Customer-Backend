import { describe, expect, it } from 'vitest';
import { DEFAULT_SDUI_THEME, SduiBuilder } from '../src/index.js';
import { DEFAULT_STACK_BASE_PROPERTIES } from '../src/core/value-objects/Layout.js';

function buildScreen(id: string) {
  return new SduiBuilder().screen(id, 'PARTNER', $ =>
    $.stackTemplate(`${id}_template`, $ =>
      $.stackComponent(`${id}_component`, $ =>
        $.textElement(`${id}_text`, $ => $.setText('CarBroz'))
      )
    )
  );
}

describe('SDUI default-property golden contract', () => {
  it('keeps defaults isolated across screen instances when one screen overrides them', () => {
    const overridden = new SduiBuilder().screen('screen_a', 'PARTNER', $ =>
      $.stackTemplate('template_a', $ =>
        $.setSpacing(12)
          .setPaddingTop(24)
          .stackComponent('component_a', $ =>
            $.textElement('text_a', $ => $.setText('A'))
          )
      )
    );

    const untouched = buildScreen('screen_b');

    expect(overridden.template.properties).toEqual({
      orientation: 'vertical',
      verticalArrangement: { type: 'spacedBy', spacing: 12 },
      padding: { start: 0, top: 24, end: 0, bottom: 0 },
    });
    expect(untouched.template.properties).toEqual({
      orientation: 'vertical',
      verticalArrangement: { type: 'spacedBy', spacing: 0 },
      padding: { start: 0, top: 0, end: 0, bottom: 0 },
    });
    expect(DEFAULT_STACK_BASE_PROPERTIES).toEqual({
      orientation: 'vertical',
      verticalArrangement: { type: 'spacedBy', spacing: 0 },
      padding: { start: 0, top: 0, end: 0, bottom: 0 },
    });
  });

  it('emits declared defaults while omitting supported non-default properties not supplied', () => {
    const screen = buildScreen('screen_defaults');

    expect(screen.template.properties).toEqual(DEFAULT_STACK_BASE_PROPERTIES);
    expect(screen.template.properties).not.toHaveProperty('horizontalAlignment');
    expect(screen.template.properties).not.toHaveProperty('fillMaxWidth');
    expect(screen.template.properties).not.toHaveProperty('background');
  });

  it('emits the canonical screen theme when no theme override is authored', () => {
    expect(buildScreen('screen_default_theme').theme).toEqual(DEFAULT_SDUI_THEME);
  });

  it('deep merges scoped theme setters without mutating the canonical theme or another screen', () => {
    const overridden = new SduiBuilder().screen('screen_theme_override', 'PARTNER', $ =>
      $.setTheme($ =>
        $.setStatusBar('default')
          .setGradientAngle(90)
      )
      .stackTemplate('theme_override_template', $ =>
        $.stackComponent('theme_override_component', $ =>
          $.textElement('theme_override_text', $ => $.setText('Override'))
        )
      )
    );

    const untouched = buildScreen('screen_theme_untouched');

    expect(overridden.theme).toMatchObject({
      theme: 'light',
      statusBar: 'default',
      properties: {
        gradient: {
          type: 'linear',
          angle: 90,
          colors: [
            { color: '#DDF8F6', stop: 0 },
            { color: '#F7FEFD', stop: 0.28 },
            { color: '#FFFFFF', stop: 0.55 },
            { color: '#D9F7F4', stop: 1 },
          ],
        },
      },
    });
    expect(untouched.theme).toEqual(DEFAULT_SDUI_THEME);
    expect(DEFAULT_SDUI_THEME).toMatchObject({
      theme: 'light',
      statusBar: 'transparent',
      properties: { gradient: { type: 'linear', angle: 135 } },
    });
  });
});
