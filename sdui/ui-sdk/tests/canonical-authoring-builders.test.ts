import { describe, expect, it } from 'vitest';
import {
  ButtonBuilder,
  CURRENT_SDUI_SCHEMA_VERSION,
  SduiScreenBuilder,
} from '../src/public/index.js';

describe('canonical returned-object SDUI authoring', () => {
  it('uses fluent root configuration and method-name-defined types', () => {
    const screen = new SduiScreenBuilder();
    screen
      .id('canonical_builder')
      .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
      .targetApp('PARTNER');

    const template = screen.addStackTemplate('canonical_template');
    const component = template.addStackComponent('canonical_component');
    const section = component.addStackSection('canonical_section');
    const group = section.addStackGroup('canonical_group');
    const title = group.addText('canonical_title');

    title.value('Canonical');

    const built = screen.build();
    const builtComponent = built.template.components[0]!;

    expect(built.template.type).toBe('stack_template');
    expect(builtComponent.type).toBe('stack_component');
    expect('sections' in builtComponent).toBe(true);
    if (!('sections' in builtComponent)) throw new Error('Expected section branch');
    expect(builtComponent.sections[0]!.type).toBe('stack_section');
    expect('groups' in builtComponent.sections[0]!).toBe(true);
    if (!('groups' in builtComponent.sections[0]!)) throw new Error('Expected group branch');
    expect(builtComponent.sections[0]!.groups[0]!.type).toBe('stack_group');
    expect(builtComponent.sections[0]!.groups[0]!.elements[0]!.type).toBe('text');
  });

  it('keeps sibling ownership stable when nodes are configured later and out of creation order', () => {
    const screen = new SduiScreenBuilder();
    screen
      .id('late_configuration')
      .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
      .targetApp('PARTNER');

    const template = screen.addStackTemplate('template');
    const first = template.addStackComponent('first');
    const second = template.addStackComponent('second');
    const third = template.addStackComponent('third');

    const secondText = second.addText('second_text');
    const firstText = first.addText('first_text');
    const thirdText = third.addText('third_text');

    third.vertical().spacing(30);
    first.horizontal().spacing(10);
    second.vertical().spacing(20);

    secondText.value('Second');
    thirdText.value('Third');
    firstText.value('First');

    const built = screen.build();

    expect(built.template.components.map((component) => component.id)).toEqual(['first', 'second', 'third']);
    expect(built.template.components[0]).toHaveProperty('elements.0.id', 'first_text');
    expect(built.template.components[1]).toHaveProperty('elements.0.id', 'second_text');
    expect(built.template.components[2]).toHaveProperty('elements.0.id', 'third_text');
    expect(built.template.components[0]!.properties).toMatchObject({
      orientation: 'horizontal',
      horizontalArrangement: { type: 'spacedBy', spacing: 10 },
    });
    expect(built.template.components[1]!.properties).toMatchObject({
      orientation: 'vertical',
      verticalArrangement: { type: 'spacedBy', spacing: 20 },
    });
  });

  it('serializes typed theme authoring to the existing canonical theme shape', () => {
    const screen = new SduiScreenBuilder();
    screen
      .id('theme_builder')
      .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
      .targetApp('PARTNER');

    const theme = screen.theme();
    theme
      .light()
      .statusBarTransparent();

    theme
      .linearGradient()
      .angle(135)
      .addColor('#DDF8F6', 0)
      .addColor('#FFFFFF', 1);

    const component = screen
      .addStackTemplate('theme_template')
      .addStackComponent('theme_component');
    component.addText('theme_text').value('Theme');

    expect(screen.build().theme).toEqual({
      theme: 'light',
      statusBar: 'transparent',
      properties: {
        gradient: {
          type: 'linear',
          angle: 135,
          colors: [
            { color: '#DDF8F6', stop: 0 },
            { color: '#FFFFFF', stop: 1 },
          ],
        },
      },
    });
  });

  it('serializes typed request/body authoring to the existing action contract', () => {
    const button = new ButtonBuilder('continue_button');
    button.text('Continue').fillMaxWidth();

    const request = button.onClickRequest();
    request
      .method('POST')
      .endpoint('/api/v1/partner/auth/send_otp')
      .authentication('NONE')
      .validate(true)
      .responseMode('destination');

    const body = request.body();
    body.binding('phoneNumber', 'mobileNumber');
    body.context('deviceId', 'deviceId');
    body.response('challengeId', 'data.challengeId');
    body.literal('attempt', 1);

    expect(button.build().actions?.onClick).toEqual({
      type: 'request',
      payload: {
        method: 'POST',
        endpoint: '/api/v1/partner/auth/send_otp',
        authentication: 'NONE',
        validate: true,
        body: {
          phoneNumber: { $binding: 'mobileNumber' },
          deviceId: { $context: 'deviceId' },
          challengeId: { $response: 'data.challengeId' },
          attempt: { $literal: 1 },
        },
        responseMode: 'destination',
      },
    });
  });

  it('requires root identity, version, target, and exactly one template before final build', () => {
    const missingIdentity = new SduiScreenBuilder();
    missingIdentity.addStackTemplate('template').addStackComponent('component').addText('text').value('Text');
    expect(() => missingIdentity.build()).toThrow(/screen id/);

    const noTemplate = new SduiScreenBuilder();
    noTemplate
      .id('no_template')
      .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
      .targetApp('PARTNER');
    expect(() => noTemplate.build()).toThrow(/exactly one template/);

    const duplicateTemplate = new SduiScreenBuilder();
    duplicateTemplate
      .id('duplicate_template')
      .schemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
      .targetApp('PARTNER');
    duplicateTemplate.addStackTemplate('one');
    expect(() => duplicateTemplate.addStackTemplate('two')).toThrow(/exactly one template/);
  });
});
