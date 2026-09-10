import { describe, expect, it } from 'vitest';
import { SduiBuilder } from '../src/index.js';
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
});
