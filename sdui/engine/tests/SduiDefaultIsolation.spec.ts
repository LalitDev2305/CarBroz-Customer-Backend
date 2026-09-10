import { describe, expect, it } from 'vitest';
import { DEFAULT_SDUI_THEME, SduiBuilder } from '../src/index.js';
import { DEFAULT_STACK_BASE_PROPERTIES } from '../src/core/value-objects/Layout.js';

function buildScreen(id: string) {
  return new SduiBuilder().screen({ id, targetApp: 'PARTNER' }, root => {
    root.template('stack_template', `${id}_template`, template => {
      template.component('stack_component', `${id}_component`, component => {
        component.text(`${id}_text`, text => text.content().text('CarBroz'));
      });
    });
  });
}

describe('SDUI default-property golden contract', () => {
  it('keeps defaults isolated across screen instances when one screen overrides them', () => {
    const overridden = new SduiBuilder().screen({ id: 'screen_a', targetApp: 'PARTNER' }, root => {
      root.template('stack_template', 'template_a', template => {
        template.base().spacing(12).paddingTop(24);
        template.component('stack_component', 'component_a', component => {
          component.text('text_a', text => text.content().text('A'));
        });
      });
    });

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

  it('emits declared defaults while omitting supported non-default properties that were not supplied', () => {
    const screen = buildScreen('screen_defaults');

    expect(screen.template.properties).toEqual(DEFAULT_STACK_BASE_PROPERTIES);
    expect(screen.template.properties).not.toHaveProperty('horizontalAlignment');
    expect(screen.template.properties).not.toHaveProperty('fillMaxWidth');
    expect(screen.template.properties).not.toHaveProperty('background');
  });

  it('emits the canonical screen theme when a screen declares no theme data', () => {
    const screen = buildScreen('screen_default_theme');

    expect(screen.theme).toEqual(DEFAULT_SDUI_THEME);
  });

  it('deep merges a screen theme override without mutating the canonical theme or another screen', () => {
    const overridden = new SduiBuilder().screen({
      id: 'screen_theme_override',
      targetApp: 'PARTNER',
      theme: {
        statusBar: 'default',
        properties: {
          gradient: {
            angle: 90,
          },
        },
      },
    }, root => {
      root.template('stack_template', 'theme_override_template', template => {
        template.component('stack_component', 'theme_override_component', component => {
          component.text('theme_override_text', text => text.content().text('Override'));
        });
      });
    });

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
