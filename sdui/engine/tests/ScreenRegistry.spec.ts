import { describe, expect, it } from 'vitest';
import {
  CURRENT_SDUI_SCHEMA_VERSION,
  DuplicateScreenRegistrationError,
  ScreenRegistry,
  SduiBuilder,
  SduiService,
  SduiValidator,
  UnknownScreenError,
  type ScreenComposer,
  type SduiScreen,
} from '../src/index.js';

function validPartnerScreen(screenId = 'partner_test'): SduiScreen {
  return new SduiBuilder().screen(screenId, 'PARTNER', $ =>
    $.setSchemaVersion(CURRENT_SDUI_SCHEMA_VERSION)
      .defaultTemplate(`${screenId}_template`, $ =>
        $.stackComponent(`${screenId}_component`, $ =>
          $.textElement(`${screenId}_title`, $ => $.setText('Test screen'))
        )
      )
  );
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
