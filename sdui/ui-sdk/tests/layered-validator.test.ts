import { describe, expect, it } from 'vitest';
import {
  BaseSduiScreenBuilder,
  CURRENT_SDUI_SCHEMA_VERSION,
  isValidSduiScreen,
  parseSduiScreen,
  parseSduiScreenForPublication,
} from '../src/public/index.js';

function validScreen() {
  const screen = new BaseSduiScreenBuilder({
    screenId: 'validator_contract',
    schemaVersion: CURRENT_SDUI_SCHEMA_VERSION,
    targetApp: 'PARTNER',
  });
  const template = screen.addStackTemplate('template');
  const component = template.addStackComponent('component');
  component.addText('text', 'Valid');
  return screen.build();
}

describe('layered SDUI validator', () => {
  it('accepts a fully canonical document at authoring and publication boundaries', () => {
    const screen = validScreen();
    expect(parseSduiScreen(screen)).toEqual(screen);
    expect(parseSduiScreenForPublication(screen)).toEqual(screen);
    expect(isValidSduiScreen(screen)).toBe(true);
  });

  it('rejects a structurally valid document whose definition type is not registered', () => {
    const screen = validScreen();
    const invalid = {
      ...screen,
      template: { ...screen.template, type: 'unregistered_template' },
    };
    expect(() => parseSduiScreen(invalid)).toThrow(/not registered|Unknown|definition/i);
  });

  it('rejects unknown properties through the exact definition property contract', () => {
    const screen = validScreen();
    const component = screen.template.components[0]!;
    const invalid = {
      ...screen,
      template: {
        ...screen.template,
        components: [{
          ...component,
          properties: { ...component.properties, unsupportedProperty: true },
        }],
      },
    };
    expect(() => parseSduiScreen(invalid)).toThrow();
  });

  it('rejects unsupported schema versions before publication', () => {
    const screen = validScreen();
    expect(() => parseSduiScreenForPublication({ ...screen, schemaVersion: '99.0.0' }))
      .toThrow(/Unsupported SDUI schema version/);
  });

  it('retains 3.0 only as backward-compatible persisted-document support', () => {
    const screen = validScreen();
    expect(parseSduiScreen({ ...screen, schemaVersion: '3.0' }).schemaVersion).toBe('3.0');
  });
});
