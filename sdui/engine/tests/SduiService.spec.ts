import { describe, expect, it } from 'vitest';
import {
  ScreenRegistry,
  SduiService,
  SduiValidator,
  createProductionSduiService,
  type ScreenComposer,
  type SduiScreen,
} from '../src/index.js';

const validScreen = (screenId = 'test_screen', targetApp: 'PARTNER' | 'CUSTOMER' | 'GLOBAL' = 'PARTNER'): SduiScreen => ({
  screenId,
  schemaVersion: '3.0.0',
  targetApp,
  template: {
    id: `${screenId}_template`,
    type: 'stack_template',
    components: [{
      id: `${screenId}_component`,
      type: 'stack_component',
      elements: [{ id: `${screenId}_text`, type: 'text', properties: { text: 'Hello' } }],
    }],
  },
});

const composer = (screen: SduiScreen, build?: ScreenComposer['build']): ScreenComposer => ({
  screenId: 'test_screen',
  targetApp: 'PARTNER',
  build: build ?? (() => screen),
});

describe('SduiService canonical composition boundary', () => {
  it('resolves, builds and validates a registered screen with default context', () => {
    const registry = new ScreenRegistry().register(composer(validScreen()));
    const service = new SduiService(registry, new SduiValidator());

    expect(service.buildScreen({ targetApp: 'PARTNER', screenId: 'test_screen' })).toMatchObject({
      screenId: 'test_screen',
      targetApp: 'PARTNER',
    });
  });

  it('passes caller context to the composer', () => {
    let received: unknown;
    const registry = new ScreenRegistry().register(composer(validScreen(), (context) => {
      received = context;
      return validScreen();
    }));
    const service = new SduiService(registry, new SduiValidator());
    const context = { locale: 'en-IN' };

    service.buildScreen({ targetApp: 'PARTNER', screenId: 'test_screen', context });
    expect(received).toBe(context);
  });

  it('fails fast when a composer returns a different screen id', () => {
    const registry = new ScreenRegistry().register(composer(validScreen('wrong_screen')));
    const service = new SduiService(registry, new SduiValidator());

    expect(() => service.buildScreen({ targetApp: 'PARTNER', screenId: 'test_screen' }))
      .toThrow("SDUI composer returned screenId 'wrong_screen' for requested screen 'test_screen'");
  });

  it('fails fast when a composer returns a different target app', () => {
    const registry = new ScreenRegistry().register(composer(validScreen('test_screen', 'CUSTOMER')));
    const service = new SduiService(registry, new SduiValidator());

    expect(() => service.buildScreen({ targetApp: 'PARTNER', screenId: 'test_screen' }))
      .toThrow("SDUI composer returned target 'CUSTOMER' for requested target 'PARTNER'");
  });

  it('exposes the production factory without creating a second composition path', () => {
    expect(createProductionSduiService()).toBeInstanceOf(SduiService);
  });
});
