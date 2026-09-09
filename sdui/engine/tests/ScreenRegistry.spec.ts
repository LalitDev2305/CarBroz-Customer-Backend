import { describe, expect, it } from 'vitest';
import {
  CURRENT_SDUI_SCHEMA_VERSION,
  SduiScreenBuilder,
  type SduiScreen,
} from '@carbroz/ui-sdk';
import {
  DuplicateScreenRegistrationError,
  ScreenRegistry,
  SduiService,
  SduiValidator,
  UnknownScreenError,
  type ScreenComposer,
} from '../src/index.js';

function validPartnerScreen(screenId = 'partner_test'): SduiScreen {
  const screen = new SduiScreenBuilder();
  screen.id(screenId).schemaVersion(CURRENT_SDUI_SCHEMA_VERSION).targetApp('PARTNER');

  const template = screen.addDefaultTemplate(`${screenId}_template`);
  template.vertical().fillMaxSize();

  const component = template.addStackComponent(`${screenId}_component`);
  component.vertical();

  component.addText(`${screenId}_title`).value('Test screen');
  return screen.build();
}

function composer(screenId = 'partner_test'): ScreenComposer {
  return {
    screenId,
    targetApp: 'PARTNER',
    build: () => validPartnerScreen(screenId),
  };
}

describe('ScreenRegistry', () => {
  it('gets a registered screen by target and id', () => {
    const registry = new ScreenRegistry().register(composer());
    expect(registry.get('PARTNER', 'partner_test').screenId).toBe('partner_test');
  });

  it('rejects duplicate registration for the same target and id', () => {
    const registry = new ScreenRegistry().register(composer());
    expect(() => registry.register(composer())).toThrow(DuplicateScreenRegistrationError);
  });

  it('rejects unknown screens', () => {
    const registry = new ScreenRegistry();
    expect(() => registry.get('PARTNER', 'missing')).toThrow(UnknownScreenError);
  });
});

describe('SduiService', () => {
  it('builds and validates a registered screen', () => {
    const registry = new ScreenRegistry().register(composer());
    const service = new SduiService(registry, new SduiValidator());

    const screen = service.buildScreen({ targetApp: 'PARTNER', screenId: 'partner_test' });

    expect(screen.screenId).toBe('partner_test');
    expect(screen.targetApp).toBe('PARTNER');
  });

  it('rejects a composer that returns a different screen id', () => {
    const registry = new ScreenRegistry().register({
      screenId: 'partner_test',
      targetApp: 'PARTNER',
      build: () => validPartnerScreen('different_screen'),
    });
    const service = new SduiService(registry, new SduiValidator());

    expect(() =>
      service.buildScreen({ targetApp: 'PARTNER', screenId: 'partner_test' }),
    ).toThrow("returned screenId 'different_screen'");
  });
});
